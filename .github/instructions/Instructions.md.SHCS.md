---
applyTo: '**'
---
# MERN Development Guide: Smart Health Care System

This document provides a complete guide for developing the **Smart Health Care System for Urban Hospitals** using the MERN stack (MongoDB, Express.js, React, Node.js).

## 1. Project Overview

The Smart Healthcare System is a web-based solution designed to streamline hospital operations in urban areas, addressing challenges like long waiting times and limited coordination between departments[cite: 12, 13]. By integrating core hospital processes into a single platform, it aims to enhance communication, reduce manual workload, and provide patients with faster, safer, and more reliable healthcare services[cite: 14, 22].

### 2. Core Features (Use Cases)

The system is built around four key functionalities:
* **UC-1: Patient Appointment & Registration**: Enables patients to book, reschedule, or cancel appointments online[cite: 18, 146].
* **UC-2: Triage & Admission**: Supports nurse triage, assessment of patient severity, and admission to wards or the ER[cite: 19, 154].
* **UC-3: Order Lab Tests & View Results**: Allows clinicians to digitally request lab tests, track the process, and view results[cite: 20, 151].
* **UC-4: E-Prescription & Pharmacy Dispense**: Provides for digital prescriptions, validation of medication, and pharmacy dispensing[cite: 21, 143].

### 3. Technology Stack

* **Frontend**: React, React Router
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (with Mongoose)
* **Authentication**: JSON Web Tokens (JWT)
* **Development Tool**: GitHub Copilot

### 4. User Roles

The system is designed for the following key user roles, identified from the use case diagrams and scenarios:
* **Patient**: Books and manages appointments, views medical records and lab results[cite: 146].
* **Doctor**: Manages patient records, orders lab tests, creates e-prescriptions, and views their schedule[cite: 151].
* **Triage Nurse**: Records patient vitals, assigns severity levels, and manages patient admission or queuing[cite: 154].
* **Lab Technician**: Receives lab orders, processes samples, and inputs test results into the system[cite: 24, 130].
* **Pharmacist**: Receives and validates e-prescriptions, checks inventory, and dispenses medication[cite: 143].

---

## 5. Backend Architecture (Server)

### 5.1. Database Models (Mongoose Schemas)

* **`User`**
    * `name`: { type: String, required: true }
    * `email`: { type: String, required: true, unique: true }
    * `password`: { type: String, required: true }
    * `role`: { type: String, enum: ['Patient', 'Doctor', 'Nurse', 'LabTechnician', 'Pharmacist', 'Staff'], required: true }
    * `digitalHealthCardId`: { type: String, unique: true, sparse: true }
* **`Appointment`**
    * `patientId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * `doctorId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * `date`: { type: Date, required: true }
    * `time`: { type: String, required: true }
    * `status`: { type: String, enum: ['Scheduled', 'Completed', 'Canceled'], default: 'Scheduled' }
* **`TriageRecord`**
    * `patientId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * [cite_start]`vitals`: { bp: String, hr: String, temp: String } [cite: 154]
    * [cite_start]`symptoms`: { type: String } [cite: 154]
    * [cite_start]`severityLevel`: { type: String, enum: ['Critical', 'Stable', 'Normal'] } [cite: 154]
    * [cite_start]`admissionStatus`: { type: String, enum: ['Queued', 'Admitted-ER', 'Admitted-Ward'] } [cite: 154]
* **`LabOrder`**
    * `patientId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * `doctorId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * [cite_start]`testType`: { type: String, required: true } [cite: 151]
    * `status`: { type: String, enum: ['Ordered', 'Sample-Collected', 'Processing', 'Completed'], default: 'Ordered' }
    * `results`: { type: String }
    * [cite_start]`priority`: { type: String, enum: ['Routine', 'Urgent'] } [cite: 151]
* **`EPrescription`**
    * `patientId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * `doctorId`: { type: Schema.Types.ObjectId, ref: 'User' }
    * [cite_start]`medications`: [{ name: String, dosage: String, frequency: String }] [cite: 143]
    * [cite_start]`status`: { type: String, enum: ['Pending', 'Dispensed', 'Rejected'], default: 'Pending' } [cite: 143]
* **`Bed`**
    * `bedNumber`: { type: String, required: true }
    * `ward`: { type: String }
    * [cite_start]`status`: { type: String, enum: ['Vacant', 'Occupied', 'Reserved'], default: 'Vacant' } [cite: 860]

### 5.2. API Routes & Controllers

| Route                         | Method | Controller Method                | Description                                                                 |
| ----------------------------- | ------ | -------------------------------- | --------------------------------------------------------------------------- |
| `/api/auth/register`          | POST   | `authController.register`        | Register a new user.                                                        |
| `/api/auth/login`             | POST   | `authController.login`           | Authenticate a user and return a JWT.                                       |
| `/api/appointments`           | POST   | `appointmentController.create`   | [cite_start]Book a new appointment for a patient[cite: 146].                              |
| `/api/appointments/me`        | GET    | `appointmentController.get`      | Get all appointments for the logged-in user.                                |
| `/api/appointments/:id`       | PUT    | `appointmentController.update`   | [cite_start]Reschedule or cancel an appointment[cite: 146].                               |
| `/api/triage`                 | POST   | `triageController.create`        | [cite_start]Create a new triage record for a patient after scanning a health card[cite: 154]. |
| `/api/beds`                   | GET    | `triageController.getBeds`       | [cite_start]Get the status of all hospital beds[cite: 860].                               |
| `/api/beds/assign`            | PUT    | `triageController.assignBed`     | [cite_start]Assign a patient to an available bed[cite: 862, 867].                         |
| `/api/labs/order`             | POST   | `labController.createOrder`      | [cite_start]Allow a doctor to order a new lab test[cite: 151].                            |
| `/api/labs/orders`            | GET    | `labController.getOrders`        | Get all pending lab orders for the lab technician dashboard.                |
| `/api/labs/results/:orderId`  | PUT    | `labController.updateResults`    | [cite_start]Allow a lab technician to upload test results[cite: 99].                      |
| `/api/labs/:patientId`        | GET    | `labController.getResults`       | [cite_start]View lab results for a specific patient[cite: 128].                           |
| `/api/prescriptions`          | POST   | `prescriptionController.create`  | [cite_start]Allow a doctor to create an e-prescription[cite: 21].                         |
| `/api/prescriptions/pending`  | GET    | `prescriptionController.get`     | [cite_start]Get all pending prescriptions for the pharmacy dashboard[cite: 240].           |
| `/api/prescriptions/:id`      | PUT    | `prescriptionController.dispense`| [cite_start]Mark a prescription as dispensed after validation[cite: 143].               |

---

## 6. Frontend Architecture (Client)

### 6.1. Pages (Views)

* **`HomePage.js`**: Public landing page with service details[cite: 459].
* **`LoginPage.js` / `RegisterPage.js`**: User authentication forms.
* **`PatientDashboard.js`**: Main view for patients, showing next appointment and medical record summary[cite: 640].
* **`BookAppointmentPage.js`**: Form for scheduling a new appointment with hospital and doctor selection[cite: 662].
* **`MyAppointmentsPage.js`**: Lists a patient's past and upcoming appointments with options to reschedule[cite: 682].
* **`DoctorDashboard.js`**: Shows patient list and daily schedule[cite: 353].
* **`PatientRecordPage.js`**: View a specific patient's medical history, order lab tests, and create prescriptions.
* **`TriagePage.js`**: Interface for nurses to scan a digital health card, input vitals, and assess severity[cite: 374, 402].
* **`BedManagementPage.js`**: A board overview of all bed statuses (Vacant, Occupied, Reserved) for hospital staff[cite: 858].
* **`LabDashboard.js`**: Interface for lab technicians showing pending test orders and a form to submit results[cite: 759].
* **`PharmacyDashboard.js`**: Interface for pharmacists showing a list of pending e-prescriptions with options to validate and dispense[cite: 543].

### 6.2. Reusable Components

* **`Navbar.js`**: Top navigation bar with user profile/logout.
* **`Sidebar.js`**: Side navigation for dashboards (Quick Actions, My Health, Account)[cite: 612].
* **`AppointmentCard.js`**: Displays details of a single appointment.
* **`BedStatusGrid.js`**: Visual grid showing bed availability[cite: 858].
* **`PrescriptionList.js`**: Displays pending prescriptions with patient details[cite: 528].
* **`LabOrderTable.js`**: Table showing pending lab orders with patient and test details.

### 6.3. Services (API Layer)

Create dedicated files to handle Axios API calls, separating them from UI logic.
* **`authService.js`**: `login()`, `register()`.
* **`appointmentService.js`**: `createAppointment()`, `getAppointments()`.
* **`labService.js`**: `createLabOrder()`, `getPendingOrders()`, `submitResults()`.
* **`pharmacyService.js`**: `getPendingPrescriptions()`, `dispenseMedication()`.
* **`triageService.js`**: `createTriageRecord()`, `getBedStatus()`.

---

## 7. Setup and Installation

### 7.1. Prerequisites

* Node.js and npm
* MongoDB (local instance or Atlas)
* Git

### 7.2. Backend Setup (`/server`)

1.  Navigate to the `server` directory.
2.  Install dependencies: `npm install express mongoose cors dotenv jsonwebtoken bcryptjs`
3.  Install dev dependencies: `npm install -D nodemon`
4.  Create a `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
5.  Run the server: `npm start`

### 7.3. Frontend Setup (`/client`)

1.  Use Create React App: `npx create-react-app client`
2.  Navigate to the `client` directory.
3.  Install dependencies: `npm install axios react-router-dom`
4.  Add proxy to `package.json`: `"proxy": "http://localhost:5000"`
5.  Run the client: `npm start`