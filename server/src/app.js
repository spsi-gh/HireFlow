import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createStore } from './store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret';
const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export function createApp(store = createStore()) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  const safeUser = ({ password, ...user }) => user;
  const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '4h' });

  function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
  }

  function optionalAuth(req, _res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      try { req.user = jwt.verify(token, JWT_SECRET); } catch { /* Treat invalid optional credentials as anonymous. */ }
    }
    return next();
  }

  const requireRole = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'hireflow-api' }));

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email, and an 8-character password are required' });
    if (store.findUserByEmail(email)) return res.status(409).json({ error: 'Email is already registered' });
    const user = store.createUser({ name, email, password, role: 'applicant' });
    return res.status(201).json({ user: safeUser(user), token: issueToken(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const user = store.findUserByEmail(req.body?.email || '');
    if (!user || user.password !== req.body?.password) return res.status(401).json({ error: 'Invalid email or password' });
    return res.json({ user: safeUser(user), token: issueToken(user) });
  });

  app.get('/api/jobs', optionalAuth, (req, res) => {
    const canManageJobs = ['recruiter', 'admin'].includes(req.user?.role);
    let jobs = canManageJobs ? store.jobs : store.jobs.filter((job) => job.status === 'open');
    if (req.user?.role === 'applicant') {
      const appliedJobIds = new Set(store.applications.filter((item) => item.applicantId === req.user.sub).map((item) => item.jobId));
      jobs = jobs.filter((job) => !appliedJobIds.has(job.id));
    }
    return res.json({ jobs });
  });
  app.post('/api/jobs', auth, requireRole('recruiter', 'admin'), (req, res) => {
    const { title, department, location, description } = req.body || {};
    if (!title || !department || !location) return res.status(400).json({ error: 'Title, department, and location are required' });
    return res.status(201).json({ job: store.createJob({ title, department, location, description: description || '', createdBy: req.user.sub }) });
  });
  app.patch('/api/jobs/:jobId', auth, requireRole('recruiter', 'admin'), (req, res) => {
    const job = store.jobs.find((candidate) => candidate.id === req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const { title, department, location, description, status } = req.body || {};
    if (!title || !department || !location || (status && !['open', 'closed'].includes(status))) return res.status(400).json({ error: 'Title, department, location, and a valid status are required' });
    return res.json({ job: store.updateJob(job, { title, department, location, description: description || '', status: status || job.status }) });
  });

  app.post('/api/jobs/:jobId/applications', auth, requireRole('applicant'), (req, res) => {
    const job = store.jobs.find((candidate) => candidate.id === req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(409).json({ error: 'This job is no longer accepting applications' });
    if (store.applications.some((item) => item.jobId === job.id && item.applicantId === req.user.sub)) return res.status(409).json({ error: 'You have already applied to this role' });
    const { phone, education, experience, coverLetter, resumeUrl } = req.body || {};
    if (!phone?.trim() || !education?.trim() || !experience?.trim() || !coverLetter?.trim() || !resumeUrl?.trim()) return res.status(400).json({ error: 'Phone, education, experience, cover letter, and resume link are required' });
    const application = store.createApplication({ jobId: job.id, applicantId: req.user.sub, phone, education, experience, coverLetter, resumeUrl });
    store.addAudit({ applicationId: application.id, actorId: req.user.sub, action: 'application_created', toStage: application.stage });
    return res.status(201).json({ application });
  });

  app.get('/api/applications', auth, (req, res) => {
    const applications = req.user.role === 'applicant' ? store.applications.filter((item) => item.applicantId === req.user.sub) : store.applications;
    return res.json({ applications: applications.map((item) => ({ ...item, job: store.jobs.find((job) => job.id === item.jobId), applicant: store.findUser(item.applicantId) && safeUser(store.findUser(item.applicantId)) })) });
  });

  app.patch('/api/applications/:applicationId/stage', auth, requireRole('recruiter', 'admin'), (req, res) => {
    const application = store.findApplication(req.params.applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const { stage, reason } = req.body || {};
    if (!stages.includes(stage) || !reason?.trim()) return res.status(400).json({ error: 'A valid stage and reason are required' });
    const fromStage = application.stage;
    application.stage = stage;
    application.updatedAt = new Date().toISOString();
    store.addAudit({ applicationId: application.id, actorId: req.user.sub, action: 'stage_changed', fromStage, toStage: stage, reason });
    return res.json({ application });
  });

  app.get('/api/dashboard', auth, requireRole('recruiter', 'admin'), (_req, res) => {
    const byStage = Object.fromEntries(stages.map((stage) => [stage, store.applications.filter((item) => item.stage === stage).length]));
    return res.json({ openRoles: store.jobs.filter((job) => job.status === 'open').length, totalApplicants: store.applications.length, byStage });
  });

  return app;
}
