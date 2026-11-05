# Cambridge Exam Timetable Generator

A standalone, responsive planner for Cambridge International AS & A Level examinations. Built with HTML, CSS, and vanilla JavaScript; no framework, server, build step, or package installation is required.

## Run locally

1. Keep all five files in the same folder.
2. Double-click `index.html` (or open it in your browser).
3. Select your qualification level, subjects, and components.
4. Choose **Generate my timetable**.

Selections and theme are saved in your browser's `localStorage` on that device. Use the reset icon in the top bar to clear selections.

## Features

- June 2027, administrative Zone 3 dataset
- AS, A2, or combined AS & A2 component selection
- Searchable subject cards and component-level selection
- Chronological timetable grouped by month and date
- Next-paper countdown and summary cards
- Subject, qualification, month, session, and text filters
- Same-date/session potential-overlap warnings
- CSV and date-only ICS calendar exports
- Browser print stylesheet for Print / Save as PDF
- Dark theme by default; theme preference persists
- Responsive desktop, tablet, and mobile layout

## Data structure

`exam-data.js` exposes:

- `EXAM_META`: series, zone, official source, and source version
- `SUBJECTS`: subject catalogue, category, syllabus code, and component definitions
- `EXAMS`: normalized exam records used by the timetable
- `EXAM_WINDOWS`: date-window entries without fabricated session or duration

Each normalized exam includes subject, syllabus and component codes, component name, level (`AS` or `A2`), date or date range, session, duration, exam type, zone, series, verification flag, and source URL. Add a subject to `SUBJECTS` and its components to extend the planner. For future sessions, add another dataset and change `EXAM_META` / the session selector in the UI.

## Data provenance and limitations

Exam dates, sessions, and durations in the supplied subject set were transcribed from Cambridge International's **June 2027 Final Exam Timetable, Administrative Zone 3, Version 1 (November 2026)**:

https://www.cambridgeinternational.org/Images/766281-june-2027-zone-3-timetable.pdf

Practical date windows are listed separately because the official timetable does not necessarily specify a session or duration for those windows. Exact exam start times are not generated: Cambridge key times and centre arrangements apply. A same-day or same-session grouping is flagged as a *potential overlap*, not asserted to be an impossible clash; centres may use supervised arrangements and official clash reports.

This is an independent student planning aid, not a Cambridge International product. Always confirm entries, start times, and arrangements with your examination centre.

## File map

- `index.html` — semantic app structure
- `style.css` — layout, themes, responsive styles, print stylesheet
- `script.js` — selection state, generation, filters, countdown, conflict checks, exports
- `exam-data.js` — examination data and metadata
- `README.md` — this file
