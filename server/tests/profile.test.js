import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/User.js';
import { generateToken } from '../src/utils/auth.js';

describe('Profile API Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@profile.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      bloodType: 'A+',
      address: '123 Test St, Test City, Test State',
    });

    // Generate auth token for test user
    authToken = generateToken(testUser._id);
  });

  afterAll(async () => {
    // Clean up test user
    await User.deleteOne({ email: 'testuser@profile.com' });
  });

  describe('GET /api/v1/profile', () => {
    it('should return user profile with role-specific data when authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Test User');
      expect(response.body.data).toHaveProperty('email', 'testuser@profile.com');
      expect(response.body.data).toHaveProperty('userRole', 'Patient');
      expect(response.body.data).toHaveProperty('roleData');

      // Check Patient-specific data
      expect(response.body.data.roleData).toHaveProperty('bloodGroup', 'A+');
      expect(response.body.data.roleData).toHaveProperty('insurance');
      expect(response.body.data.roleData).toHaveProperty('emergencyContact');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Specific Data Tests', () => {
    it('should return Doctor-specific data for Doctor role', async () => {
      // Create a doctor user
      const doctorUser = await User.create({
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'password123',
        role: 'Doctor',
        specialization: 'Cardiology',
        licenseNumber: 'DOC123456',
        department: 'Cardiology',
      });

      const doctorToken = generateToken(doctorUser._id);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.data.userRole).toBe('Doctor');
      expect(response.body.data.roleData).toHaveProperty('specialization', 'Cardiology');
      expect(response.body.data.roleData).toHaveProperty('licenseNumber', 'DOC123456');
      expect(response.body.data.roleData).toHaveProperty('department', 'Cardiology');
      expect(response.body.data.roleData).toHaveProperty('todayAppointmentsCount');
      expect(response.body.data.roleData).toHaveProperty('totalPatientsServed');

      // Clean up
      await User.deleteOne({ email: 'doctor@test.com' });
    });

    it('should return Admin-specific data for Admin role', async () => {
      // Create an admin user
      const adminUser = await User.create({
        name: 'Admin Test',
        email: 'admin@test.com',
        password: 'password123',
        role: 'Admin',
        department: 'Administration',
      });

      const adminToken = generateToken(adminUser._id);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.userRole).toBe('Admin');
      expect(response.body.data.roleData).toHaveProperty('systemStats');
      expect(response.body.data.roleData.systemStats).toHaveProperty('totalUsers');
      expect(response.body.data.roleData.systemStats).toHaveProperty('totalPatients');
      expect(response.body.data.roleData.systemStats).toHaveProperty('totalDoctors');
      expect(response.body.data.roleData).toHaveProperty('adminTools');
      expect(response.body.data.roleData).toHaveProperty('permissions');

      // Clean up
      await User.deleteOne({ email: 'admin@test.com' });
    });
  });

  describe('Data Security Tests', () => {
    it('should not include password in the response', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should only return data for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify that the returned user ID matches the test user
      expect(response.body.data.id).toBe(testUser._id.toString());
      expect(response.body.data.email).toBe(testUser.email);
    });
  });
});
