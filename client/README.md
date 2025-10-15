# Smart Health Care System - Frontend

This is the React frontend application for the Smart Health Care System.

## Features

- **Patient Portal**: Book appointments, view medical history
- **Doctor Dashboard**: Manage appointments, view patient records, order tests, create prescriptions
- **Nurse Portal**: Triage assessment, bed management
- **Lab Technician**: Manage lab orders and results
- **Pharmacist**: Manage prescriptions and dispensing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

## Project Structure

```
client/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── Sidebar.js
│   │   ├── AppointmentCard.js
│   │   ├── BedStatusGrid.js
│   │   ├── PrescriptionList.js
│   │   └── LabOrderTable.js
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.js
│   ├── pages/             # Page components
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── PatientDashboard.js
│   │   ├── DoctorDashboard.js
│   │   ├── TriagePage.js
│   │   ├── LabDashboard.js
│   │   ├── PharmacyDashboard.js
│   │   ├── BookAppointmentPage.js
│   │   ├── MyAppointmentsPage.js
│   │   ├── PatientRecordPage.js
│   │   └── BedManagementPage.js
│   ├── services/          # API service modules
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── appointmentService.js
│   │   ├── triageService.js
│   │   ├── labService.js
│   │   └── pharmacyService.js
│   ├── utils/             # Utility functions
│   │   └── PrivateRoute.js
│   ├── App.js             # Main app component
│   ├── App.css            # Global styles
│   └── index.js           # Entry point
└── package.json
```

## User Roles

The system supports the following user roles:

1. **Patient**: Book appointments, view medical records
2. **Doctor**: Manage appointments, order tests, create prescriptions
3. **Nurse**: Triage assessment, bed management
4. **LabTechnician**: Manage lab orders and results
5. **Pharmacist**: Manage prescriptions and dispensing
6. **Staff**: General administrative functions

## Key Features by Role

### Patient
- Book appointments with doctors
- View upcoming and past appointments
- Access medical history

### Doctor
- View daily schedule
- Access patient records
- Order lab tests
- Create e-prescriptions

### Nurse
- Perform triage assessments
- Record patient vitals
- Assign beds to patients
- Manage bed availability

### Lab Technician
- View pending lab orders
- Update order status
- Add lab results

### Pharmacist
- View pending prescriptions
- Dispense medications
- Reject invalid prescriptions


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
