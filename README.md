# Smart Health Care System (MERN)

A consolidated MERN-stack reference implementation and development plan for a Smart Health Care System designed for urban hospitals. The system focuses on reducing wait times and improving coordination between departments by providing a single platform for appointments, triage/admission, laboratory orders/results, and e-prescription + pharmacy workflows.

The repository contains a prescriptive implementation blueprint in `AGENTS.md` intended for an automated coding agent (Copilot) or developers to implement the project end-to-end.

Note: For high-level domain context, an attached project brief was used during scoping. All technical implementation details are self-contained in `AGENTS.md`.

## Quick links
- AGENTS.md — authoritative, self-contained spec and implementation plan (models, API, frontend, tasks)
- CODE_OF_CONDUCT.md — Code of conduct
- CONTRIBUTING.md — Contributing guidelines
- SECURITY.md — Security policy

## Project overview

Goals:
- Allow patients to register, book and manage appointments.
- Support nurse triage, severity assessment, and bed management.
- Enable doctors to order lab tests and create e-prescriptions.
- Provide lab technicians and pharmacists with dedicated dashboards for processing orders and dispensing medication.

Primary user roles:
- Patient
- Doctor
- Nurse (Triage)
- Lab Technician
- Pharmacist
- Staff (administrative)

Core features:
- Appointment booking and management
- Triage records and bed assignment
- Lab test ordering and results management
- E-prescription creation, validation, and dispensing

## Technology stack
- Frontend: React (recommended with react-router-dom)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Authentication: JWT
- HTTP client: Axios (frontend)

## Recommended repository layout
- /server — backend server (Express + Mongoose)
- /client — React front-end
- `AGENTS.md` — comprehensive spec, tasks, and implementation plan
- `README.md` — this document

## Quickstart (developer)

1. Backend

- Create `server` folder and initialize a Node project.
- Install dependencies (example list):

```powershell
cd server
npm init -y
npm install express mongoose cors dotenv jsonwebtoken bcryptjs
npm install -D nodemon
```

- Create a `.env` with:

```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-health
JWT_SECRET=your_jwt_secret
```

- Add an npm script to `package.json` for development:

```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

- Start the server:

```powershell
npm run dev
```

2. Frontend

- Create `client` with Create React App or preferred starter.

```powershell
npx create-react-app client
cd client
npm install axios react-router-dom
npm start
```

- Add a proxy in `client/package.json` if running backend on port 5000:

```json
"proxy": "http://localhost:5000"
```

## API summary (high level)

Auth
- POST /api/auth/register — register a new user
- POST /api/auth/login — obtain JWT

Appointments
- POST /api/appointments — create appointment
- GET /api/appointments/me — list current user's appointments
- PUT /api/appointments/:id — update/reschedule/cancel

Triage & Beds
- POST /api/triage — create triage record (nurse)
- GET /api/beds — list beds
- PUT /api/beds/assign — assign bed to patient

Labs
- POST /api/labs/order — create a lab order (doctor)
- GET /api/labs/orders — lab technician dashboard (pending)
- PUT /api/labs/results/:orderId — lab technician uploads results
- GET /api/labs/:patientId — view patient's lab results

Prescriptions
- POST /api/prescriptions — create e-prescription (doctor)
- GET /api/prescriptions/pending — pharmacist dashboard
- PUT /api/prescriptions/:id — pharmacist dispenses/rejects

Refer to `AGENTS.md` for full details, data models, validation, and role-based rules.

## Data models (short)
- User (name, email, password, role, digitalHealthCardId)
- Appointment (patientId, doctorId, date, time, status)
- TriageRecord (vitals, symptoms, severityLevel, admissionStatus)
- LabOrder (testType, status, results, priority)
- EPrescription (medications[], status, validatedBy)
- Bed (bedNumber, ward, status)

## Development plan & milestones
See `AGENTS.md` for the prioritized implementation plan, and acceptance criteria for each task:
- Backend skeleton, auth, appointment endpoints
- Triage, bed management, labs, prescriptions
- Frontend dashboards and flows

## Tests, linting, and CI
- Backend tests: Jest + supertest for route tests
- Linting: ESLint + Prettier
- CI: GitHub Actions to run lint and tests on PRs

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Questions & assumptions
- JWT tokens include a role claim for role-based access control.
- Lab results are entered manually via a lab technician UI (no instrument integration in MVP).
- No advanced privacy auditing is implemented in MVP (discuss if needed).

---

Project brief

A domain brief was used to scope the project and determine user roles and use cases. All technical details needed for implementation are included in `AGENTS.md`.

---

License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.