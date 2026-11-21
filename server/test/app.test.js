import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import request from 'supertest';

const app = createApp();
async function tokenFor(email, password = 'Password123!') {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.token;
}

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

test('recruiter can create and edit a job posting', async () => {
  const token = await tokenFor('recruiter@hireflow.local');
  const created = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send({ title: 'Backend Developer', department: 'Platform', location: 'Remote', description: 'Build APIs.' });
  assert.equal(created.status, 201);
  const updated = await request(app).patch(`/api/jobs/${created.body.job.id}`).set('Authorization', `Bearer ${token}`).send({ title: 'Senior Backend Developer', department: 'Platform', location: 'Remote', description: 'Build secure APIs.', status: 'open' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.job.title, 'Senior Backend Developer');
});

test('applicant must submit application details and recruiter can update status', async () => {
  const recruiterToken = await tokenFor('recruiter@hireflow.local');
  const applicantToken = await tokenFor('applicant@hireflow.local');
  const jobs = await request(app).get('/api/jobs');
  const job = jobs.body.jobs[0];
  const application = await request(app).post(`/api/jobs/${job.id}/applications`).set('Authorization', `Bearer ${applicantToken}`).send({ phone: '9999999999', education: 'B.Tech Computer Science', experience: '2 years React and Node.js', coverLetter: 'I would love to contribute.', resumeUrl: 'https://example.com/resume.pdf' });
  assert.equal(application.status, 201);
  const updated = await request(app).patch(`/api/applications/${application.body.application.id}/stage`).set('Authorization', `Bearer ${recruiterToken}`).send({ stage: 'Interview', reason: 'Passed initial screening' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.application.stage, 'Interview');
});
