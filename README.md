# HireFlow

HireFlow is a recruitment and onboarding tracker for small and mid-sized teams. This repository contains the first working MVP described in the project synopsis.

## Current MVP

- Role-aware authentication for applicants, recruiters, and administrators
- Job posting creation and listing
- Candidate application flow
- Recruiter Kanban pipeline with audited stage changes
- Basic recruiter dashboard metrics
- Automated CI checks through GitHub Actions

The initial implementation uses an in-memory repository so the product can be demonstrated without external infrastructure. The repository boundary is deliberately separated so MongoDB Atlas can be added without rewriting the HTTP API.

## Run locally

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:5173`.

For separate workspaces:

```bash
npm --prefix server install
npm --prefix client install
npm --prefix server run dev
npm --prefix client run dev
```

See `.env.example` files in `server` and `client` for configuration.

## GitHub Pages

The frontend is configured for the repository path `/HireFlow/` and is deployed by `.github/workflows/deploy-pages.yml`. In the repository settings, set Pages to use GitHub Actions. The API must still be hosted separately and supplied through the `VITE_API_URL` environment variable for login and data operations to work outside local development.

## Demo accounts

The API seeds one recruiter and one applicant when it starts:

- Recruiter: `recruiter@hireflow.local` / `Password123!`
- Applicant: `applicant@hireflow.local` / `Password123!`

These accounts are for local demonstration only.

## Project workflow

Work is organized as small commits aligned to the synopsis backlog. Every pull request is expected to pass the GitHub Actions CI workflow before review.

