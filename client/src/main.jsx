import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('recruiter@hireflow.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    try { onLogin(await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })); }
    catch (err) { setError(err.message); }
  }
  return <main className="login-shell"><section className="login-card"><p className="eyebrow">RECRUITMENT OPERATIONS</p><h1>HireFlow</h1><p className="muted">Move every candidate from first application to confident onboarding.</p><form onSubmit={submit}><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label><label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>{error && <p className="error">{error}</p>}<button type="submit">Sign in</button></form><p className="hint">Demo: recruiter@hireflow.local / Password123!</p></section></main>;
}

function App({ session, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dashboard, setDashboard] = useState({ openRoles: 0, totalApplicants: 0, byStage: {} });
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${session.token}` };
  const load = async () => { try { const [jobData, applicationData] = await Promise.all([api('/jobs'), api('/applications', { headers })]); setJobs(jobData.jobs); setApplications(applicationData.applications); if (session.user.role !== 'applicant') setDashboard((await api('/dashboard', { headers }))); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const grouped = useMemo(() => Object.fromEntries(stages.map((stage) => [stage, applications.filter((item) => item.stage === stage)])), [applications]);
  async function move(applicationId, stage) { const reason = window.prompt(`Reason for moving to ${stage}:`, 'Reviewed by recruiter'); if (!reason) return; try { await api(`/applications/${applicationId}/stage`, { method: 'PATCH', headers, body: JSON.stringify({ stage, reason }) }); load(); } catch (err) { setError(err.message); } }
  return <main><header className="topbar"><div><p className="eyebrow">HIRE OPERATIONS / 01</p><h1>Recruitment workspace</h1></div><div className="user-menu"><span>{session.user.name} · {session.user.role}</span><button className="secondary" onClick={onLogout}>Sign out</button></div></header><section className="content">{error && <p className="error banner">{error}</p>}<div className="metrics"><Metric label="Open roles" value={dashboard.openRoles || jobs.length} /><Metric label="Applicants" value={dashboard.totalApplicants || applications.length} /><Metric label="In interview" value={dashboard.byStage?.Interview || 0} /><Metric label="Offers" value={dashboard.byStage?.Offer || 0} /></div>{session.user.role === 'recruiter' ? <><div className="section-heading"><div><p className="eyebrow">LIVE PIPELINE</p><h2>Candidate flow</h2></div><span className="status-pill">● Synced</span></div><div className="board">{stages.map((stage) => <div className="column" key={stage}><div className="column-title"><strong>{stage}</strong><span>{grouped[stage].length}</span></div>{grouped[stage].map((application) => <article className="candidate" key={application.id}><strong>{application.applicant?.name || 'Applicant'}</strong><span>{application.job?.title || 'Open role'}</span><select value={application.stage} onChange={(e) => move(application.id, e.target.value)}>{stages.map((option) => <option key={option}>{option}</option>)}</select></article>)}{grouped[stage].length === 0 && <p className="empty">No candidates here</p>}</div>)}</div></> : <ApplicantView jobs={jobs} headers={headers} onRefresh={load} applications={applications} />}</section></main>;
}

function Metric({ label, value }) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div>; }
function ApplicantView({ jobs, headers, onRefresh, applications }) { async function apply(jobId) { await api(`/jobs/${jobId}/applications`, { method: 'POST', headers, body: JSON.stringify({}) }); onRefresh(); } return <div className="applicant-view"><div className="section-heading"><div><p className="eyebrow">OPPORTUNITIES</p><h2>Open roles</h2></div></div>{jobs.map((job) => <article className="job-card" key={job.id}><div><h3>{job.title}</h3><p>{job.department} · {job.location}</p><p className="muted">{job.description}</p></div><button onClick={() => apply(job.id)}>Apply</button></article>)}<h2>Your applications</h2>{applications.map((application) => <p className="application-row" key={application.id}><span>{application.job?.title}</span><strong>{application.stage}</strong></p>)}</div>; }

function Root() { const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('hireflow-session') || 'null')); function login(next) { localStorage.setItem('hireflow-session', JSON.stringify(next)); setSession(next); } function logout() { localStorage.removeItem('hireflow-session'); setSession(null); } return session ? <App session={session} onLogout={logout} /> : <Login onLogin={login} />; }
createRoot(document.getElementById('root')).render(<Root />);
