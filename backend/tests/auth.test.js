const request = require('supertest');
const app = require('../server');

describe('User Authentication & API Health Endpoints', () => {
  test('GET /api/health returns healthy status and LayoverIQ info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('LayoverIQ');
    expect(res.body.tagline).toBe('Smart decisions between flights.');
  });

  test('POST /api/auth/register creates a new user account', async () => {
    const uniqueEmail = `traveler_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: uniqueEmail,
        password: 'SecurePassword123!',
        homeCity: 'Singapore',
        preferredCurrency: 'SGD'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
  });

  test('POST /api/auth/demo-login returns instant token and demo user', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toContain('Alex Vance');
  });

  test('POST /api/layover/calculate returns calculated exploration window', async () => {
    const res = await request(app)
      .post('/api/layover/calculate')
      .send({
        airportCode: 'DXB',
        arrivalTime: '2026-09-01T10:00:00Z',
        departureTime: '2026-09-01T18:00:00Z',
        preferredTransport: 'metro'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.breakdownMinutes.actualExplorationMinutes).toBeGreaterThan(0);
    expect(res.body.formatted.recommendedReturnFormatted).toBeDefined();
  });
});
