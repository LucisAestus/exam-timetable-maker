/* Cambridge International June 2027, Administrative Zone 3.
 * Source: official final timetable (Version 1, November 2026).
 * Dates/sessions/durations below are transcribed from the AS/A Level syllabus view.
 * Practical test windows are taken from the official test-date-window section.
 */
const EXAM_META = {
  series: "June 2027",
  zone: 3,
  source: "https://www.cambridgeinternational.org/Images/766281-june-2027-zone-3-timetable.pdf",
  sourceVersion: "Version 1, November 2026"
};

const SUBJECTS = [
  { name: "Biology", code: "9700", category: "Sciences", components: [
    { code:"11", name:"Multiple Choice", level:"AS", date:"2027-06-09", session:"PM", duration:"1h 15m", type:"written" },
    { code:"21", name:"Structured Questions", level:"AS", date:"2027-05-13", session:"PM", duration:"1h 15m", type:"written" },
    { code:"31", name:"Advanced Practical Skills", level:"AS", date:"2027-05-06", session:"PM", duration:"2h", type:"practical" },
    { code:"32", name:"Advanced Practical Skills", level:"AS", date:"2027-05-20", session:"PM", duration:"2h", type:"practical" },
    { code:"41", name:"Structured Questions", level:"A2", date:"2027-05-11", session:"PM", duration:"2h", type:"written" },
    { code:"51", name:"Planning, Analysis and Evaluation", level:"A2", date:"2027-05-13", session:"PM", duration:"1h 15m", type:"written" }
  ]},
  { name: "Chemistry", code: "9701", category: "Sciences", components: [
    { code:"11", name:"Multiple Choice", level:"AS", date:"2027-06-08", session:"PM", duration:"1h 15m", type:"written" },
    { code:"21", name:"Structured Questions", level:"AS", date:"2027-05-19", session:"PM", duration:"1h 15m", type:"written" },
    { code:"31", name:"Advanced Practical Skills", level:"AS", date:"2027-04-27", session:"PM", duration:"2h", type:"practical" },
    { code:"32", name:"Advanced Practical Skills", level:"AS", date:"2027-05-27", session:"PM", duration:"2h", type:"practical" },
    { code:"41", name:"Structured Questions", level:"A2", date:"2027-05-05", session:"PM", duration:"2h", type:"written" },
    { code:"51", name:"Planning, Analysis and Evaluation", level:"A2", date:"2027-05-19", session:"PM", duration:"1h 15m", type:"written" }
  ]},
  { name: "Physics", code: "9702", category: "Sciences", components: [
    { code:"11", name:"Multiple Choice", level:"AS", date:"2027-06-10", session:"PM", duration:"1h 15m", type:"written" },
    { code:"21", name:"Structured Questions", level:"AS", date:"2027-05-12", session:"PM", duration:"1h 15m", type:"written" },
    { code:"31", name:"Advanced Practical Skills", level:"AS", date:"2027-04-29", session:"PM", duration:"2h", type:"practical" },
    { code:"32", name:"Advanced Practical Skills", level:"AS", date:"2027-05-18", session:"PM", duration:"2h", type:"practical" },
    { code:"41", name:"Structured Questions", level:"A2", date:"2027-05-10", session:"PM", duration:"2h", type:"written" },
    { code:"51", name:"Planning, Analysis and Evaluation", level:"A2", date:"2027-05-12", session:"PM", duration:"1h 15m", type:"written" }
  ]},
  { name: "Mathematics", code: "9709", category: "Mathematics", components: [
    { code:"12", name:"Pure Mathematics 1", level:"AS", date:"2027-04-28", session:"AM", duration:"1h 50m", type:"written" },
    { code:"22", name:"Pure Mathematics 2", level:"AS", date:"2027-05-07", session:"AM", duration:"1h 15m", type:"written" },
    { code:"32", name:"Pure Mathematics 3", level:"A2", date:"2027-05-14", session:"AM", duration:"1h 50m", type:"written" },
    { code:"42", name:"Mechanics", level:"AS", date:"2027-05-07", session:"AM", duration:"1h 15m", type:"written" },
    { code:"52", name:"Probability & Statistics 1", level:"AS", date:"2027-05-11", session:"AM", duration:"1h 15m", type:"written" },
    { code:"62", name:"Probability & Statistics 2", level:"A2", date:"2027-05-07", session:"AM", duration:"1h 15m", type:"written" }
  ]},
  { name: "English Language", code: "9093", category: "Languages & Literature", components: [
    { code:"11", name:"Reading", level:"AS", date:"2027-04-26", session:"PM", duration:"2h 15m", type:"written" },
    { code:"21", name:"Writing", level:"AS", date:"2027-05-04", session:"PM", duration:"2h", type:"written" },
    { code:"31", name:"Language Analysis", level:"A2", date:"2027-05-07", session:"PM", duration:"2h 15m", type:"written" },
    { code:"41", name:"Language Topics", level:"A2", date:"2027-05-25", session:"PM", duration:"2h 15m", type:"written" }
  ]},
  { name: "Literature in English", code: "9695", category: "Languages & Literature", components: [
    { code:"11", name:"Poetry and Prose", level:"AS", date:"2027-04-28", session:"PM", duration:"2h", type:"written" },
    { code:"21", name:"Drama", level:"AS", date:"2027-05-10", session:"PM", duration:"2h", type:"written" },
    { code:"31", name:"Poetry and Prose", level:"A2", date:"2027-05-14", session:"PM", duration:"2h", type:"written" },
    { code:"41", name:"Drama", level:"A2", date:"2027-05-19", session:"PM", duration:"2h", type:"written" }
  ]},
  { name: "Sociology", code: "9699", category: "Humanities & Social Sciences", components: [
    { code:"12", name:"Socialisation, Identity and Methods of Research", level:"AS", date:"2027-05-11", session:"AM", duration:"1h 30m", type:"written" },
    { code:"22", name:"The Family", level:"AS", date:"2027-05-14", session:"AM", duration:"1h 30m", type:"written" },
    { code:"32", name:"Globalisation, Media and Religion", level:"A2", date:"2027-05-27", session:"AM", duration:"1h 15m", type:"written" },
    { code:"42", name:"Theory and Methods", level:"A2", date:"2027-06-01", session:"AM", duration:"1h 45m", type:"written" }
  ]},
  { name: "Business", code: "9609", category: "Humanities & Social Sciences", components: [
    { code:"12", name:"Business Concepts 1", level:"AS", date:"2027-05-04", session:"AM", duration:"1h 15m", type:"written" },
    { code:"22", name:"Business Concepts 2", level:"AS", date:"2027-05-12", session:"AM", duration:"1h 30m", type:"written" },
    { code:"32", name:"Business Concepts 3", level:"A2", date:"2027-05-13", session:"AM", duration:"1h 45m", type:"written" },
    { code:"42", name:"Business Concepts 4", level:"A2", date:"2027-05-20", session:"AM", duration:"1h 15m", type:"written" }
  ]},
  { name: "Information Technology", code: "9626", category: "Technology", components: [
    { code: "12", name: "Theory", level: "AS", date: "2027-05-10", session: "AM", duration: "1h 45m", type: "written" },
    { code: "22", name: "Practical", level: "AS", date: "2027-04-22", session: "null", duration: "2h 30m", type: "practical" },
    { code: "32", name: "Advanced Theory", level: "A2", date: "2027-05-21", session: "AM", duration: "1h 45m", type: "written" },
    { code: "42", name: "Advanced Practical", level: "A2", date: "2027-04-20", session: "null", duration: "2h 30m", type: "practical" }
  ]}
];

// Normalize subject component records into the application's shared exam schema.
const FIXED_EXAMS = SUBJECTS.flatMap(subject => subject.components.map(component => ({
  subject: subject.name,
  syllabusCode: subject.code,
  componentCode: `${subject.code}/${component.code}`,
  component: component.code,
  componentName: component.name,
  level: component.level,
  date: component.date,
  session: component.session,
  duration: component.duration,
  examType: component.type,
  zone: EXAM_META.zone,
  series: EXAM_META.series,
  verified: true,
  source: EXAM_META.source
}))) ;

const EXAMS = FIXED_EXAMS;

if (typeof window !== "undefined") {
  window.EXAM_META = EXAM_META;
  window.SUBJECTS = SUBJECTS;
  window.EXAMS = EXAMS;
}
