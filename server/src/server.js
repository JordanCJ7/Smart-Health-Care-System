import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initScheduledJobs } from './utils/scheduler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';
import triageRoutes from './routes/triageRoutes.js';
import labRoutes from './routes/labRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize scheduled jobs (slot hold cleaner, waitlist expiration, etc.)
if (process.env.NODE_ENV !== 'test') {
  initScheduledJobs();
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Health Care System API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api', triageRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Health Care System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      appointments: '/api/appointments',
      schedules: '/api/schedules',
      waitlist: '/api/waitlist',
      triage: '/api/triage',
      beds: '/api/beds',
      labs: '/api/labs',
      prescriptions: '/api/prescriptions',
      payments: '/api/payments',
      inventory: '/api/inventory',
      notifications: '/api/notifications',
    },
  });
});

// Error handlers (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

export default app;
