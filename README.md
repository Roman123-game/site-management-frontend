# Fieldboard — Site Management Frontend

React + TypeScript + Vite frontend for visual site workforce management.

## Run locally

1. Install Node.js 20 or newer.
2. Extract this project ZIP.
3. Open a terminal in the project folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL printed by Vite (usually http://localhost:5173).

## Included
- Visual site map with draggable employee circles.
- Employee statuses: Install, Repair, Upgrade, Free.
- Status summary cards and filters.
- Employee search.
- Add and remove employees.
- Employee details, task and contact fields.
- LocalStorage persistence for employees, statuses and marker positions.

## Frontend-only limitation
Data is stored in the current browser profile only. It persists across reloads on that browser, but it does not synchronize between devices or users. True multi-user live updates require a backend or hosted realtime service.
