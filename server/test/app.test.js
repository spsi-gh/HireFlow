import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import request from 'supertest';

const app = createApp();

test('health endpoint is available', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'hireflow-api' });
});

test('recruiter can log in and access dashboard metrics', async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'recruiter@hireflow.local', password: 'Password123!' });
  assert.equal(login.status, 200);
  const { token } = login.body;
  const dashboard = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.body.openRoles, 1);
});

test('unauthenticated users cannot access applications', async () => {
  const response = await request(app).get('/api/applications');
  assert.equal(response.status, 401);
});
