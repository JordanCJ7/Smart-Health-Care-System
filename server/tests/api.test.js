import request from 'supertest';
import app from '../src/server.js';

describe('Health Check', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('running');
  });
});

describe('Auth Endpoints', () => {
  it('should return error for login without credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(response.status).toBe(400);
  });

  it('should return error for invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });
    
    expect(response.status).toBe(400);
  });
});
