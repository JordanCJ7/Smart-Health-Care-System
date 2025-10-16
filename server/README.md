# Smart Health Care System - Backend Server

Production-ready backend implementation for the Smart Health Care System.

## Tech Stack
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **PayPal Sandbox** - Payment processing

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Patient, Doctor, Nurse, LabTechnician, Pharmacist, Staff)
- Password hashing with bcrypt

### Core Modules
- **Appointments** - Booking, management, and scheduling
- **Triage & Beds** - Emergency triage and bed assignment
- **Lab Orders** - Test ordering and results management
- **E-Prescriptions** - Digital prescription creation and pharmacy dispensing
- **Payments** - PayPal integration for billing

## Setup

### Prerequisites
- Node.js v16+
- MongoDB running locally or MongoDB Atlas account

### Installation

```bash
cd server
npm install
```

### Configuration

1. Copy `.env.sample` to `.env`:
```bash
cp .env.sample .env
```

2. Update the `.env` file with your configuration:
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Configure PayPal credentials for payment integration

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "Patient"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Patient"
    }
  }
}
```

### Appointment Endpoints

All appointment endpoints require authentication (Bearer token).

#### Create Appointment
```
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctorId": "doctor-id",
  "date": "2025-10-20",
  "time": "10:00 AM",
  "reason": "Regular checkup"
}
```

#### Get User's Appointments
```
GET /api/appointments/me
Authorization: Bearer {token}
```

#### Update Appointment
```
PUT /api/appointments/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Cancelled",
  "date": "2025-10-21",
  "time": "11:00 AM"
}
```

### Triage & Bed Endpoints

#### Create Triage Record (Nurse only)
```
POST /api/triage
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "patient-id",
  "vitals": {
    "bp": "120/80",
    "hr": 72,
    "temp": 98.6
  },
  "symptoms": "Chest pain",
  "severityLevel": "Critical"
}
```

#### Get All Beds (Staff)
```
GET /api/beds
Authorization: Bearer {token}
```

#### Assign Bed (Nurse/Staff)
```
PUT /api/beds/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "bedId": "bed-id",
  "patientId": "patient-id"
}
```

### Lab Order Endpoints

#### Create Lab Order (Doctor only)
```
POST /api/labs/order
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "patient-id",
  "testType": "Complete Blood Count",
  "priority": "Urgent"
}
```

#### Get Pending Lab Orders (Lab Technician)
```
GET /api/labs/orders
Authorization: Bearer {token}
```

#### Update Lab Results (Lab Technician)
```
PUT /api/labs/results/:orderId
Authorization: Bearer {token}
Content-Type: application/json

{
  "results": {
    "WBC": "7.5 x10^3/μL",
    "RBC": "5.2 x10^6/μL",
    "Hemoglobin": "14.8 g/dL"
  },
  "notes": "All values within normal range"
}
```

#### Get Patient Lab Results
```
GET /api/labs/:patientId
Authorization: Bearer {token}
```

### Prescription Endpoints

#### Create E-Prescription (Doctor only)
```
POST /api/prescriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": "patient-id",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning"
    }
  ]
}
```

#### Get Pending Prescriptions (Pharmacist)
```
GET /api/prescriptions/pending
Authorization: Bearer {token}
```

#### Dispense/Reject Prescription (Pharmacist)
```
PUT /api/prescriptions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Dispensed"
}
```

### Payment Endpoints

#### Create Payment
```
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 150.00,
  "description": "Medical consultation",
  "appointmentId": "appointment-id"
}
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security

- All passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control on all endpoints
- Input validation on all requests
- CORS configuration for client access
- Environment variables for sensitive data

## Project Structure

```
server/
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── .env.sample         # Environment template
├── package.json
└── README.md
```

## License

MIT License - see LICENSE file for details
