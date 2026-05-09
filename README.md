# MERN Project Manager (RBAC)

Full-stack MERN app for **projects + team management + tasks + dashboard**, with **Admin/Member** role-based access.

## Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally (or a MongoDB Atlas URI)

## Run backend (Express + MongoDB)

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## Run frontend (React + Vite)

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API endpoints (high level)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/members` (Admin)
- `GET /api/tasks?projectId=...`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `GET /api/dashboard`

## RBAC rules

- **Project Admin**: can edit/delete project, invite/remove members, change member roles.
- **Member**: can view project, create tasks, update tasks they created or are assigned to.

