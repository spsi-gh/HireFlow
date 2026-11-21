import crypto from 'node:crypto';

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

export function createStore() {
  const users = [
    { id: id(), name: 'Demo Recruiter', email: 'recruiter@hireflow.local', role: 'recruiter', password: 'Password123!' },
    { id: id(), name: 'Demo Applicant', email: 'applicant@hireflow.local', role: 'applicant', password: 'Password123!' }
  ];
  const jobs = [{ id: id(), title: 'Frontend Developer', department: 'Engineering', location: 'Noida / Hybrid', description: 'Build thoughtful product experiences with React.', status: 'open', createdAt: now(), createdBy: users[0].id }];
  const applications = [];
  const audit = [];

  return {
    users,
    jobs,
    applications,
    audit,
    findUserByEmail: (email) => users.find((user) => user.email.toLowerCase() === email.toLowerCase()),
    findUser: (userId) => users.find((user) => user.id === userId),
    createUser: (input) => { const user = { id: id(), ...input }; users.push(user); return user; },
    createJob: (input) => { const job = { id: id(), ...input, status: 'open', createdAt: now() }; jobs.push(job); return job; },
    createApplication: (input) => { const application = { id: id(), ...input, stage: 'Applied', createdAt: now(), updatedAt: now() }; applications.push(application); return application; },
    findApplication: (applicationId) => applications.find((application) => application.id === applicationId),
    addAudit: (input) => { audit.push({ id: id(), ...input, createdAt: now() }); }
  };
}
