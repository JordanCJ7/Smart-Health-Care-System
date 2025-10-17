# AGENTS.md

Purpose: provide a concise, machine-actionable overview of the Smart Health Care System so an automated coding agent (Copilot) can implement, extend, and validate the project end-to-end.

Contents
- Source materials analyzed
- Key differences and reconciliation decisions
- Project contract (inputs, outputs, success criteria, error modes)
- Data models (Mongoose schemas)
- API surface (endpoints, methods, auth & role rules)
- Frontend pages, components, and routing map
- Development setup & commands
- Implementation plan with prioritized tasks and milestones
- Tests, quality gates, and validation steps
- Open questions and assumptions

---

## 1. Project sources and basis

This `AGENTS.md` is a self-contained, authoritative specification for the Smart Health Care System. It consolidates domain requirements, user roles, features, and an implementation blueprint suitable for an automated coding agent.

Where the original project brief and implementation notes were consulted during drafting, all required information has been incorporated directly into this document. There are no external dependencies on other project files for understanding the design or implementation plan.

## 2. Key reconciliation decisions

High-level summary of design choices and rationale:
- The system implements four core areas: appointments, triage/admission (including bed management), lab orders/results, and e-prescription/pharmacy flows.
- Roles are explicitly defined: **Patient**, **Staff** (includes doctors, nurses, lab technicians, pharmacists), and **Admin**.
  - Staff members are distinguished by additional fields: `specialization`, `department`, `licenseNumber`
- Technology choices: MERN stack (MongoDB + Mongoose, Express, React, Node), JWT for authentication, Axios for API requests from the client.
- Pragmatic additions for implementability: Mongoose timestamps, basic indexes, centralized error handling, role-based middleware, consistent JSON API envelope.

Rationale: This document is intentionally prescriptive to let an automated agent implement a working MVP without needing to reference additional documents.

## 3. Project contract (short)

Inputs:
- API requests authenticated via JWT, optionally including role claim.
- For patient-facing flows: appointment details, triage vitals, lab orders and results, e-prescription payloads.

Outputs:
- JSON responses for CRUD endpoints (appointments, triage records, lab orders, prescriptions, beds, authentication tokens).
- For frontend: pages and components that render the JSON data and allow interaction.

Success criteria:
- Backend: implement all Mongoose models and listed API endpoints with role-based access control, basic validation, and error handling.
- Frontend: React app with routes and pages enumerated in `Instructions.md`, wired to the backend via Axios services, with authentication and role-based UI.
- Automated tests: unit tests for key controllers + 1-2 integration tests.

Error modes:
- Authentication failures (401)
- Authorization failures (403)
- Validation errors (400)
- Database errors (500)

## 4. Data models (Mongoose schemas)

Canonical schemas (from `Instructions.md`, with pragmatic additions):
- User: name, email (unique), password (hashed), role, digitalHealthCardId (sparse unique), timestamps
- Appointment: patientId, doctorId, date (Date), time (String), status (Scheduled|Completed|Canceled), createdBy, timestamps, index on date
- TriageRecord: patientId, vitals (bp, hr, temp), symptoms, severityLevel (Critical|Stable|Normal), admissionStatus (Queued|Admitted-ER|Admitted-Ward), assignedBed (ref Bed), createdBy (nurse), timestamps
- LabOrder: patientId, doctorId, testType, status (Ordered|Sample-Collected|Processing|Completed), results (structured), priority (Routine|Urgent), timestamps
- EPrescription: patientId, doctorId, medications [name, dosage, frequency], status (Pending|Dispensed|Rejected), validatedBy (pharmacist ref), timestamps
- Bed: bedNumber, ward, status (Vacant|Occupied|Reserved), currentPatient (ref), timestamps

Implementation notes:
- Use Mongoose timestamps option to add createdAt/updatedAt.
- Add simple indexes on frequently queried fields (patientId, doctorId, status).

## 5. API surface (merged & reconciled)

Auth:
- POST /api/auth/register -> register user (Patient self-register or staff can create others)
- POST /api/auth/login -> returns JWT with role claim

Appointments:
- POST /api/appointments -> create (Patient or Staff) [auth]
- GET /api/appointments/me -> get appointments for current user [auth]
- PUT /api/appointments/:id -> update status/reschedule by owner or staff [auth, role checks]

Triage & Beds:
- POST /api/triage -> create triage record (Nurse) [auth role=Nurse]
- GET /api/beds -> list beds (Staff) [auth]
- PUT /api/beds/assign -> assign bed to patient (Nurse/Staff) [auth role=Nurse|Staff]

Labs:
- POST /api/labs/order -> create lab order (Doctor) [auth role=Doctor]
- GET /api/labs/orders -> get pending lab orders (LabTechnician) [auth role=LabTechnician]
- PUT /api/labs/results/:orderId -> update results (LabTechnician) [auth role=LabTechnician]
- GET /api/labs/:patientId -> get all lab results for patient (Doctor|Patient|Staff) [auth role check]

Prescriptions:
- POST /api/prescriptions -> create e-prescription (Doctor) [auth role=Doctor]
- GET /api/prescriptions/pending -> get pending prescriptions (Pharmacist) [auth role=Pharmacist]
- PUT /api/prescriptions/:id -> dispense/reject (Pharmacist) [auth role=Pharmacist]

General notes:
- All endpoints return JSON in a consistent envelope { success: boolean, data, error }
- Implement centralized error handling middleware
- Add validation using express-validator or Joi (minimal validation for key fields)

## 6. Frontend pages and components (mapped)

Pages (priority order for implementation):
1. Auth: `LoginPage.js`, `RegisterPage.js`
2. Dashboards: `PatientDashboard.js`, `DoctorDashboard.js`, `TriagePage.js` (nurse), `LabDashboard.js` (lab tech), `PharmacyDashboard.js` (pharmacist)
3. Appointment flows: `BookAppointmentPage.js`, `MyAppointmentsPage.js`
4. PatientRecordPage.js: view patient history, order lab tests, create prescriptions (doctor)
5. BedManagementPage.js: visualize beds

Reusable components:
- `Navbar.js`, `Sidebar.js`, `AppointmentCard.js`, `BedStatusGrid.js`, `PrescriptionList.js`, `LabOrderTable.js`

Services (axios wrappers):
- `authService.js`, `appointmentService.js`, `triageService.js`, `labService.js`, `pharmacyService.js`

Routing & auth hooks:
- Use `react-router-dom` with private routes guarded by JWT and role. Implement `useAuth` hook.

UI notes:
- Keep UI minimal and accessible. No design framework mandated; use plain CSS or a lightweight library (Tailwind/Bootstrap) if desired.

## 7. Development setup & commands

Repository layout (recommended):
- /server - Node/Express backend
- /client - React frontend

Backend quick start (in /server):
- npm install
- copy .env.sample -> .env set PORT, MONGO_URI, JWT_SECRET
- npm run dev (nodemon)

Frontend quick start (in /client):
- npm install
- npm start

Add a root README with these steps and include `AGENTS.md` link.

## 8. Implementation plan (actionable for Copilot)

I'll provide a prioritized task list for an automated agent to implement. Each task is atomic and has acceptance criteria.

Sprint 1 - Minimum Viable Backend (3-5 days):
- Task 1.1: Initialize `/server` with package.json, express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, nodemon.
  - Acceptance: `npm run dev` starts server and responds on /api/health.
- Task 1.2: Implement User model and auth routes (register/login) with password hashing and JWT.
  - Acceptance: Can register and login; login returns JWT containing user id and role.
- Task 1.3: Implement Appointment model and endpoints (create/get/me/update).
  - Acceptance: Create appointment and fetch for a user works with token.
- Task 1.4: Add role middleware and central error handler.

Sprint 2 - Triage, Beds, Labs, Prescriptions (3-7 days):
- Task 2.1: Implement TriageRecord and Bed models and endpoints for triage and bed assignment.
- Task 2.2: Implement LabOrder model and endpoints for doctors and lab technicians.
- Task 2.3: Implement EPrescription model and endpoints for doctors and pharmacists.

Sprint 3 - Frontend (React) (5-10 days):
- Task 3.1: Initialize `/client` with CRA, set up routing and auth context.
- Task 3.2: Implement Login/Register pages and a protected route wrapper.
- Task 3.3: Implement PatientDashboard and BookAppointment flow.
- Task 3.4: Implement DoctorDashboard and PatientRecord to order labs and create prescriptions.
- Task 3.5: Implement LabDashboard and PharmacyDashboard.

Cross-cutting tasks:
- Add simple tests (jest + supertest for backend controllers)
- Add linting (ESLint) and formatting (Prettier)
- Add CI (GitHub Actions) for lint and tests

## 9. Tests & quality gates

- Backend unit tests: controllers and services. Use Jest + supertest for route tests.
- Run quick checks after each file change: node --check, npm run lint, npm test (if present)
- Quality gates to report: Build PASS/FAIL, Lint PASS/FAIL, Tests PASS/FAIL

## 10. Open questions and assumptions

Assumptions made while merging sources:
- `Instructions.md` is canonical for field names and route design.
- Authentication is via JWT; tokens include a role claim.
- No HIPAA-level encryption or audit logging is required for MVP.
- No external integrations (payment, labs instrument) required; lab results are entered manually.

Questions for the user:
- Do you prefer Bootstrapped UI (Bootstrap/Tailwind) or custom CSS?
- Should patient registration require verification (email)?

---

## Appendix A - Diff summary between the two provided files

Both sources are consistent. The main extra emphasis in the PDF was on domain justification and role importance. `Instructions.md` contains explicit implementation details. The merged spec uses `Instructions.md` as implementation blueprint and retains PDF role emphasis.


## Appendix B - Next steps for a Copilot agent

1. Initialize repo folders `/server` and `/client` and commit.
2. Implement Sprint 1 tasks in small commits with descriptive messages.
3. Run tests and linters after each commit.
4. Open a PR for review when Sprint 1 is complete.

---

End of AGENTS.md
