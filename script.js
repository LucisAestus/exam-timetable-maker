(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = "cambridgeExamPlanner_v1";
  const THEME_KEY = "cambridgeExamPlanner_theme";
  const state = { level: "BOTH", selected: {}, generated: false, exams: [], filters: {subject:"all",level:"all",month:"all",session:"all",search:""} };
  let toastTimer;

  const levelAllowed = (componentLevel) => state.level === "BOTH" || (state.level === "AS" && componentLevel === "AS") || (state.level === "A2" && componentLevel === "A2");
  const allComponentsFor = subject => subject.components.filter(c => levelAllowed(c.level));
  const selectedComponents = subject => (state.selected[subject.code] || []).filter(code => subject.components.some(c => c.code === code && levelAllowed(c.level)));
  const selectedCount = () => SUBJECTS.filter(subject => selectedComponents(subject).length).length;
  const selectedPaperCount = () => SUBJECTS.reduce((n, subject) => n + selectedComponents(subject).length, 0);
  const formatDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const shortDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"});
  const monthName = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined,{month:"long",year:"numeric"});
  const monthKey = iso => iso.slice(0,7);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const getSubject = code => SUBJECTS.find(s => s.code === code);

  function saveState(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({level:state.level,selected:state.selected,generated:state.generated})); } catch(e) { console.warn("Local storage unavailable",e); }
  }
  function loadState(){
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if(saved){
        if(["AS","A2","BOTH"].includes(saved.level)) state.level=saved.level;
        if(saved.selected && typeof saved.selected === "object"){
          SUBJECTS.forEach(subject => {
            const valid = new Set(subject.components.map(c=>c.code));
            state.selected[subject.code] = (saved.selected[subject.code] || []).filter(code=>valid.has(code));
          });
        }
        state.generated=Boolean(saved.generated);
      }
    } catch(e){ console.warn("Could not load saved planner state",e); }
    const theme=localStorage.getItem(THEME_KEY);
    if(theme) document.documentElement.dataset.theme=theme;
  }
  function showToast(message){
    const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
  }
  function updateThemeControl(){
    const isLight=document.documentElement.dataset.theme==="light";
    $("#themeIcon").textContent=isLight?"☾":"☼";
    $("#themeText").textContent=isLight?"Dark appearance":"Light appearance";
  }
  function toggleTheme(){
    const next=document.documentElement.dataset.theme==="light"?"dark":"light";
    if(next==="dark") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme="light";
    localStorage.setItem(THEME_KEY,next); updateThemeControl();
  }
  function renderSubjects(){
    const query=$("#subjectSearch").value.trim().toLowerCase();
    const grid=$("#subjectGrid");
    grid.innerHTML="";
    SUBJECTS.filter(s=>`${s.name} ${s.code} ${s.category}`.toLowerCase().includes(query)).forEach(subject=>{
      const allowed=allComponentsFor(subject);
      const chosen=selectedComponents(subject);
      const card=document.createElement("article");
      card.className=`subject-card ${chosen.length?"selected":""}`;
      const componentMarkup=allowed.map(c=>{
        const checked=chosen.includes(c.code);
        return `<label class="component-row"><input type="checkbox" data-subject="${subject.code}" data-component="${c.code}" ${checked?"checked":""}/><span class="comp-code">${subject.code}/${c.code}</span><span>${escapeHtml(c.name)}</span><span class="level-mini">${c.level}</span></label>`;
      }).join("");
      card.innerHTML=`<div class="subject-main" role="button" tabindex="0" aria-label="Toggle ${escapeHtml(subject.name)}"><span class="custom-check">${chosen.length?"✓":""}</span><span class="subject-name">${escapeHtml(subject.name)}</span><span class="subject-code">${subject.code}</span></div><div class="subject-category">${escapeHtml(subject.category)} · ${allowed.length} papers available</div>${chosen.length?`<div class="component-list">${componentMarkup}</div>`:""}`;
      const main=$(".subject-main",card);
      const toggleSubject=()=>{
        if(selectedComponents(subject).length) state.selected[subject.code]=[];
        else state.selected[subject.code]=allowed.map(c=>c.code);
        saveState(); renderSubjects(); updateSelectionMeta();
      };
      main.addEventListener("click",toggleSubject);
      main.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleSubject();}});
      card.addEventListener("change",e=>{
        const input=e.target;
        if(!input.matches("input[data-component]"))return;
        const codes=selectedComponents(subject).slice();
        if(input.checked&&!codes.includes(input.dataset.component))codes.push(input.dataset.component);
        if(!input.checked)state.selected[subject.code]=codes.filter(code=>code!==input.dataset.component);
        else state.selected[subject.code]=codes;
        saveState(); renderSubjects(); updateSelectionMeta();
      });
      grid.appendChild(card);
    });
    if(!grid.children.length) grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1;padding:25px"><h3>No subjects match</h3><p>Try a different subject name or syllabus code.</p></div>`;
  }
  function updateSelectionMeta(){
    const count=selectedCount(), papers=selectedPaperCount();
    $("#selectedCount").textContent=`${count} subject${count===1?"":"s"} · ${papers} paper${papers===1?"":"s"}`;
    $("#selectionStatus").textContent=count?`${papers} components selected · saved on this device`:"Your selection is saved locally";
    $("#sidebar-count").textContent=state.exams.length||"—";
    $("#selectAllBtn").textContent=SUBJECTS.every(s=>selectedComponents(s).length===allComponentsFor(s).length)?"Deselect all":"Select all";
  }
  function normalizeExam(exam){
    const date=exam.date || exam.dateRange?.start;
    return {...exam,sortDate:date,sortSession:exam.session==="AM"?0:exam.session==="PM"?1:2};
  }
  function buildTimetable(){
    const chosen=[];
    SUBJECTS.forEach(subject=>{
      const selected=selectedComponents(subject);
      subject.components.filter(c=>selected.includes(c.code) && levelAllowed(c.level)).forEach(c=>{
        const exam=EXAMS.find(e=>e.syllabusCode===subject.code && e.component===c.code && e.level===c.level);
        if(exam) chosen.push(normalizeExam(exam));
      });
    });
    chosen.sort((a,b)=>a.sortDate.localeCompare(b.sortDate)||a.sortSession-b.sortSession||a.syllabusCode.localeCompare(b.syllabusCode)||a.component.localeCompare(b.component));
    return chosen;
  }
  function generate(){
    if(!selectedPaperCount()){showToast("Select at least one subject component first.");return;}
    const panel=$(".config-panel");panel.classList.add("loading-state");$("#generateBtn").textContent="Building timeline…";
    setTimeout(()=>{
      state.exams=buildTimetable();state.generated=true;saveState();
      panel.classList.remove("loading-state");$("#generateBtn").innerHTML='Generate my timetable <span>→</span>';
      updateSelectionMeta();renderSchedule();switchView("schedule");showToast("Your timetable is ready.");
    },420);
  }
  function getNextExam(exams){
    const today=new Date();today.setHours(0,0,0,0);
    return exams.find(exam=>new Date(`${exam.sortDate}T00:00:00`)>=today) || null;
  }
  function durationMinutes(duration){
    if(!duration)return null;
    let total=0;const h=duration.match(/(\d+)h/),m=duration.match(/(\d+)m/);
    if(h)total+=Number(h[1])*60;if(m)total+=Number(m[1]);return total||null;
  }
  function getConflicts(exams){
    const groups={};exams.filter(e=>e.session).forEach(e=>{
      const key=`${e.date}|${e.session}`;(groups[key] ||= []).push(e);
    });
    return Object.values(groups).filter(group=>group.length>1);
  }
  function renderStats(exams){
    const fixed=exams.filter(e=>e.date),subjects=new Set(exams.map(e=>e.subject));
    const first=fixed[0],last=fixed[fixed.length-1],next=getNextExam(exams);
    let days="—";
    if(next){const now=new Date();now.setHours(0,0,0,0);days=Math.max(0,Math.ceil((new Date(`${next.sortDate}T00:00:00`)-now)/86400000));}
    const items=[
      ["TOTAL PAPERS",exams.length,"Across your selected components"],
      ["SUBJECTS",subjects.size,"In this examination series"],
      ["FIRST EXAM",first?shortDate(first.date):"Date window","Your schedule begins"],
      ["LAST EXAM",last?shortDate(last.date):"Date window","Final fixed-date paper"]
    ];
    $("#statsGrid").innerHTML=items.map((item,i)=>`<div class="stat-card"><div class="stat-label">${item[0]}</div><div class="stat-value ${i===0?"stat-accent":""}">${escapeHtml(item[1])}</div><div class="stat-foot">${escapeHtml(item[2])}</div></div>`).join("");
    if(next){
      const countdown=`${days} <small>DAY${days===1?"":"S"} LEFT</small>`;
      $("#countdownBanner").innerHTML=`<div class="countdown-icon">◷</div><div><div class="countdown-text">Next up · ${escapeHtml(next.subject)}</div><div class="countdown-sub">${escapeHtml(next.componentCode)} · ${formatDate(next.date)} · ${next.session||"Date window"}</div></div><div class="countdown-number">${countdown}</div>`;
    }else{
      $("#countdownBanner").innerHTML=`<div class="countdown-icon">✓</div><div><div class="countdown-text">You're all caught up</div><div class="countdown-sub">No upcoming fixed-date papers in this selection.</div></div>`;
    }
  }
  function populateFilters(exams){
    const subjectSelect=$("#subjectFilter"),previous=state.filters.subject;
    subjectSelect.innerHTML='<option value="all">All subjects</option>';
    [...new Set(exams.map(e=>e.subject))].sort().forEach(name=>subjectSelect.add(new Option(name,name)));
    subjectSelect.value=[...subjectSelect.options].some(o=>o.value===previous)?previous:"all";
  }
  function examMatchesFilter(exam){
    const f=state.filters;
    if(f.subject!=="all"&&exam.subject!==f.subject)return false;
    if(f.level!=="all"&&exam.level!==f.level)return false;
    if(f.month!=="all"&&(!exam.sortDate||monthKey(exam.sortDate)!==f.month))return false;
    if(f.session==="window"&&!exam.dateRange)return false;
    if(["AM","PM"].includes(f.session)&&exam.session!==f.session)return false;
    const q=f.search.toLowerCase();
    return !q||`${exam.subject} ${exam.syllabusCode} ${exam.componentCode} ${exam.componentName} ${exam.level}`.toLowerCase().includes(q);
  }
  function renderTimeline(exams){
    const container=$("#timelineContainer");container.innerHTML="";
    const filtered=exams.filter(examMatchesFilter);
    $("#scheduleEmpty").classList.toggle("hidden",filtered.length!==0);
    container.classList.toggle("hidden",filtered.length===0);
    const byMonth={};filtered.forEach(e=>(byMonth[monthKey(e.sortDate)] ||= []).push(e));
    const next=getNextExam(exams);
    Object.keys(byMonth).sort().forEach(key=>{
      const monthExams=byMonth[key],section=document.createElement("section");section.className="month-section";
      section.innerHTML=`<div class="month-heading"><h2>${monthName(`${key}-01`)}</h2><span class="month-count">${monthExams.length} paper${monthExams.length===1?"":"s"}</span><span class="month-line"></span></div>`;
      const byDay={};monthExams.forEach(e=>(byDay[e.sortDate] ||= []).push(e));
      Object.keys(byDay).sort().forEach(date=>{
        const dayExams=byDay[date],group=document.createElement("div"),clash=dayExams.length>1;
        const dateObj=new Date(`${date}T12:00:00`),day=dateObj.toLocaleDateString(undefined,{weekday:"long"}),month=dateObj.toLocaleDateString(undefined,{month:"short"}).toUpperCase();
        const isWindow=dayExams.some(e=>e.dateRange);
        group.className="day-group";
        group.innerHTML=`<div class="day-header"><div class="date-block"><strong>${dateObj.getDate()}</strong><small>${month}</small></div><div><div class="day-title">${day}</div><div class="day-subtitle">${dayExams.length} examination${dayExams.length===1?"":"s"}</div></div><div class="day-badges">${clash?'<span class="tag clash">Multiple exams</span>':''}${isWindow?'<span class="tag window">Date window</span>':''}</div></div>`;
        dayExams.forEach(exam=>{
          const isNext=next&&exam.componentCode===next.componentCode&&exam.sortDate===next.sortDate&&exam.subject===next.subject;
          const row=document.createElement("div");row.className=`exam-row ${isNext?"next-exam":""}`;
          const session=exam.session||"TBC";
          const detail=`<span class="exam-code">${escapeHtml(exam.componentCode)}</span><span>${escapeHtml(exam.componentName)}</span><span class="exam-level">${exam.level==="AS"?"AS LEVEL":"A LEVEL"}</span>${exam.examType==="practical"?'<span class="exam-type">◈ Practical</span>':''}`;
          const duration=exam.duration?`<span class="exam-duration">${escapeHtml(exam.duration)}</span>`:"";
          const dateWindow=exam.dateRange?`<span class="window-date">${shortDate(exam.dateRange.start)} – ${shortDate(exam.dateRange.end)}</span>`:"";
          row.innerHTML=`<div class="session-label ${session==="PM"?"pm":""}">${session}</div><div><div class="exam-title">${escapeHtml(exam.subject)} ${isNext?'<span class="tag" style="color:var(--accent)">UP NEXT</span>':''}</div><div class="exam-detail">${detail}${dateWindow}</div></div>${duration}`;
          group.appendChild(row);
        });
        section.appendChild(group);
      });
      container.appendChild(section);
    });
    if(filtered.length===0&&exams.length===0) $("#scheduleEmpty").innerHTML='<div class="empty-icon">▦</div><h3>No timetable yet</h3><p>Choose subjects and components to generate your personal schedule.</p><button class="text-button" id="emptySetupBtn">Configure subjects</button>';
    const emptySetup=$("#emptySetupBtn");if(emptySetup)emptySetup.onclick=()=>switchView("setup");
  }
  function renderSchedule(){
    renderStats(state.exams);populateFilters(state.exams);
    const conflicts=getConflicts(state.exams);
    const notice=$("#conflictNotice");
    if(conflicts.length){
      const conflictPapers=conflicts.reduce((n,g)=>n+g.length,0);
      notice.classList.remove("hidden");notice.innerHTML=`<strong>Potential scheduling overlap:</strong> ${conflicts.length} date/session group${conflicts.length===1?"":"s"} contain ${conflictPapers} papers. Same-session papers may be handled by your centre with supervised arrangements; confirm against your official entry/timetable clash report.`;
    }else{notice.classList.add("hidden");}
    renderTimeline(state.exams);
    updateSelectionMeta();
  }
  function switchView(view){
    const showSchedule=view==="schedule";
    $("#setupView").classList.toggle("hidden",showSchedule);
    $("#scheduleView").classList.toggle("hidden",!showSchedule);
    $$(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
    $("#breadcrumbCurrent").textContent=showSchedule?"My timetable":"Configuration";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function csvCell(value){return `"${String(value??"").replace(/"/g,'""')}"`;}
  function downloadFile(filename,content,type){
    const blob=new Blob([content],{type});const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportCSV(){
    const headers=["Date","Day","Session","Subject","Syllabus code","Component code","Component name","Level","Duration","Exam type","Date window start","Date window end"];
    const rows=state.exams.map(e=>[e.date||e.dateRange?.start||"",e.date?new Date(`${e.date}T12:00:00`).toLocaleDateString(undefined,{weekday:"long"}):"Date window",e.session||"Centre scheduled",e.subject,e.syllabusCode,e.componentCode,e.componentName,e.level,e.duration||"",e.examType,e.dateRange?.start||"",e.dateRange?.end||""]);
    downloadFile("my-cambridge-exam-timetable.csv",[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n"),"text/csv;charset=utf-8");showToast("CSV timetable downloaded.");
  }
  function icsEscape(text){return String(text||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");}
  function exportICS(){
    const now=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
    const events=state.exams.map(e=>{
      const date=e.date||e.dateRange?.start;
      const dt=date.replace(/-/g,"");
      const summary=`${e.subject} — ${e.componentCode} ${e.componentName}`;
      const description=[`Cambridge International ${e.level==="AS"?"AS Level":"A Level"} examination`, `Syllabus: ${e.syllabusCode}`,`Component: ${e.componentCode} (${e.componentName})`,e.session?`Session: ${e.session}`:"Session and exact start time are set by your examination centre.",e.duration?`Duration: ${e.duration}`:"Duration not specified in this export.",e.dateRange?`Official date window: ${e.dateRange.start} to ${e.dateRange.end}`:"",`Zone: ${e.zone} · Series: ${e.series}`,`Source: ${EXAM_META.source}`].filter(Boolean).join("\\n");
      // Date-only events avoid fabricating an exact exam start time.
      return ["BEGIN:VEVENT",`UID:${e.syllabusCode}-${e.component}-${date}@cambridge-exam-planner`,"DTSTAMP:"+now,`DTSTART;VALUE=DATE:${dt}`,`DTEND;VALUE=DATE:${(()=>{const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+1);return d.toISOString().slice(0,10).replace(/-/g,"");})()}`,`SUMMARY:${icsEscape(summary)}`,`DESCRIPTION:${icsEscape(description)}`,"END:VEVENT"].join("\r\n");
    }).join("\r\n");
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Cambridge Exam Planner//June 2027 Zone 3//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Cambridge Exams — June 2027","X-WR-CALDESC:Personal Cambridge International AS & A Level exam schedule",events,"END:VCALENDAR"].join("\r\n");
    downloadFile("cambridge-exams-june-2027.ics",ics,"text/calendar;charset=utf-8");showToast("Calendar file downloaded. Import it into your calendar app.");
  }
  function resetAll(){
    if(!confirm("Clear all selected subjects and components?"))return;
    state.selected={};SUBJECTS.forEach(s=>state.selected[s.code]=[]);state.generated=false;state.exams=[];
    localStorage.removeItem(STORAGE_KEY);renderSubjects();updateSelectionMeta();switchView("setup");showToast("Selections cleared.");
  }
  function clearFilters(){
    state.filters={subject:"all",level:"all",month:"all",session:"all",search:""};
    $("#examSearch").value="";$("#subjectFilter").value="all";$("#levelFilter").value="all";$("#monthFilter").value="all";$("#sessionFilter").value="all";renderTimeline(state.exams);
  }
  function bindEvents(){
    $("#themeToggle").addEventListener("click",toggleTheme);
    $("#levelSelect").addEventListener("change",e=>{
      state.level=e.target.value;
      // Keep prior picks that remain valid; adding a level does not silently auto-select extra papers.
      renderSubjects();saveState();updateSelectionMeta();
    });
    $("#subjectSearch").addEventListener("input",renderSubjects);
    $("#selectAllBtn").addEventListener("click",()=>{
      if(SUBJECTS.every(s=>selectedComponents(s).length===allComponentsFor(s).length)) SUBJECTS.forEach(s=>state.selected[s.code]=[]);
      else SUBJECTS.forEach(s=>state.selected[s.code]=allComponentsFor(s).map(c=>c.code));
      saveState();renderSubjects();updateSelectionMeta();
    });
    $("#generateBtn").addEventListener("click",generate);
    $("#resetBtn").addEventListener("click",resetAll);
    $$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
      if(btn.dataset.view==="schedule"&&!state.generated){showToast("Generate your timetable first.");return;}
      switchView(btn.dataset.view);
    }));
    $("#backToSetup").addEventListener("click",()=>switchView("setup"));
    $("#printBtn").addEventListener("click",()=>window.print());$("#printMenuBtn").addEventListener("click",()=>{window.print();$("#exportDropdown").classList.add("hidden");});
    $("#exportBtn").addEventListener("click",e=>{e.stopPropagation();$("#exportDropdown").classList.toggle("hidden");});
    document.addEventListener("click",e=>{if(!e.target.closest(".export-menu"))$("#exportDropdown").classList.add("hidden");});
    $("#csvBtn").addEventListener("click",()=>{exportCSV();$("#exportDropdown").classList.add("hidden");});
    $("#icsBtn").addEventListener("click",()=>{exportICS();$("#exportDropdown").classList.add("hidden");});
    $("#subjectFilter").addEventListener("change",e=>{state.filters.subject=e.target.value;renderTimeline(state.exams);});
    $("#levelFilter").addEventListener("change",e=>{state.filters.level=e.target.value;renderTimeline(state.exams);});
    $("#monthFilter").addEventListener("change",e=>{state.filters.month=e.target.value;renderTimeline(state.exams);});
    $("#sessionFilter").addEventListener("change",e=>{state.filters.session=e.target.value;renderTimeline(state.exams);});
    $("#examSearch").addEventListener("input",e=>{state.filters.search=e.target.value;renderTimeline(state.exams);});
    $("#clearFilters").addEventListener("click",clearFilters);
  }
  function init(){
    loadState();$("#levelSelect").value=state.level;
    SUBJECTS.forEach(s=>{if(!state.selected[s.code])state.selected[s.code]=[];});
    renderSubjects();updateSelectionMeta();updateThemeControl();bindEvents();
    if(state.generated&&selectedPaperCount()){state.exams=buildTimetable();renderSchedule();switchView("schedule");}
  }
  init();
})();
