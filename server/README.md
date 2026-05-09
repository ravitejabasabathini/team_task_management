# Server

## Setup

```bash
copy .env.example .env
npm install
npm run dev
```

## Notes

- Set `MONGODB_URI` to your local MongoDB or Atlas connection string.
- Auth uses a **Bearer JWT** returned by `/api/auth/login` and `/api/auth/signup`.

