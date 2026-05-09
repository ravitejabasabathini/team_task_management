const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { connectDb } = require('./db/connectDb');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/projects.routes');
const taskRoutes = require('./routes/tasks.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

connectDb();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / tools without an Origin header
      if (!origin) return cb(null, true);

      const allowed = new Set(
        (process.env.CORS_ORIGIN || 'http://localhost:5173')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      // Allow any localhost/127.0.0.1 dev port (Vite may auto-pick 5174+)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      if (allowed.has(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

