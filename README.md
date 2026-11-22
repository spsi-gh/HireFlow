# HireFlow
### A Smarter Way to Manage Recruitment and Onboarding

HireFlow is a centralized recruitment and onboarding management platform designed for small and mid-sized teams. It streamlines the hiring process by connecting applicants, recruiters, and administrators through a structured and easy-to-manage system.

From publishing job openings to tracking candidate applications and managing recruitment stages, HireFlow brings the essential hiring workflow together in one place.

---

## Overview

Recruitment involves multiple stages, users, and repetitive tasks. Managing these processes manually can become difficult as teams grow.

HireFlow aims to simplify this process by providing a unified platform where recruiters can manage job openings, monitor applicants, track candidate progress, and access recruitment insights, while applicants can explore and apply for available opportunities.

## Key Features

**Role-Based Authentication**
- Dedicated access for Applicants, Recruiters, and Administrators.
- Role-aware authentication and user-specific functionality.

**Job Management**
- Create and publish job openings.
- Browse and view available job listings.

**Candidate Application Management**
- Applicants can submit applications for available positions.
- Recruiters can manage incoming applications.

**Recruitment Pipeline**
- Kanban-based candidate tracking system.
- Move candidates across different recruitment stages.
- Audited stage changes for improved transparency.

**Recruiter Dashboard**
- Basic recruitment metrics.
- Overview of recruitment activities and candidate progress.

**Automated CI**
- GitHub Actions integration.
- Automated checks to maintain development quality.

---

## How It Works

The HireFlow recruitment workflow follows a structured process:

1. Recruiters access their dashboard.
2. Job openings are created and published.
3. Applicants explore available positions and submit applications.
4. Recruiters review and manage candidate applications.
5. Candidates progress through different stages using the Kanban pipeline.
6. Recruitment activities can be monitored through dashboard metrics.

---

## User Roles

| Role | Responsibilities |
|---|---|
| Applicant | Explore job openings and submit applications. |
| Recruiter | Create jobs, review applications, and manage candidate pipelines. |
| Administrator | Access the administrative functionality of the platform. |

---

## Technology and Architecture

HireFlow follows a modular architecture that separates the frontend, backend, and data access layers.

| Component | Implementation |
|---|---|
| Frontend | Client application |
| Backend | Node.js server |
| API | HTTP API |
| Data Storage | In-memory repository |
| Planned Database | MongoDB Atlas |
| CI/CD | GitHub Actions |
| Frontend Deployment | GitHub Pages |

The current MVP uses an in-memory repository to support demonstrations without requiring external database infrastructure.

The repository layer is designed to allow future MongoDB Atlas integration without rewriting the existing HTTP API.

---

## Project Structure

```text
HireFlow/
│
├── client/
│   └── Frontend application
│
├── server/
│   └── Backend application
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
│
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Node.js
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/spsi-gh/HireFlow.git
cd HireFlow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Refer to the `.env.example` files inside the `client` and `server` directories.

Configure the required environment variables before starting the application.

### 4. Run the Application

```bash
npm run dev
```

The application will be available at:

| Service | Local URL |
|---|---|
| Backend API | http://localhost:4000 |
| Frontend | http://localhost:5173 |

### Running Frontend and Backend Separately

Backend:

```bash
npm --prefix server install
npm --prefix server run dev
```

Frontend:

```bash
npm --prefix client install
npm --prefix client run dev
```

---

## Demo Credentials

The application automatically seeds demonstration accounts when the API starts.

| User Role | Email | Password |
|---|---|---|
| Recruiter | recruiter@hireflow.local | Password123! |
| Applicant | applicant@hireflow.local | Password123! |

These credentials are intended exclusively for local demonstration.

---

## Deployment

### GitHub Pages

The frontend is configured for deployment under the repository path:

`/HireFlow/`

To enable deployment:

1. Open the repository settings.
2. Navigate to Settings → Pages.
3. Select GitHub Actions as the deployment source.
4. The deployment workflow will handle the frontend build and deployment.

### Backend Deployment

The backend API must be hosted separately.

Set the following environment variable in the frontend deployment configuration:

```env
VITE_API_URL=https://your-backend-api-url
```

A deployed backend is required for authentication and data operations outside local development.

---

## Development Workflow

The project follows an incremental development approach aligned with the project synopsis.

- Features are developed through small, focused commits.
- The repository follows a modular structure.
- GitHub Actions performs automated CI checks.
- Pull requests are expected to pass CI checks before review.

---

## Future Scope

The current implementation represents the first working MVP. Potential future enhancements include:

- MongoDB Atlas integration for persistent data storage.
- Resume upload and candidate profile management.
- Advanced recruitment analytics and reporting.
- Interview scheduling and email notifications.
- Structured employee onboarding workflows.
- Enhanced administrator controls.

---

## Project Vision

HireFlow aims to make recruitment more organized, transparent, and efficient by bringing job management, candidate tracking, and onboarding workflows into a unified platform.

**Simplifying recruitment. Organizing talent. Streamlining hiring.**
