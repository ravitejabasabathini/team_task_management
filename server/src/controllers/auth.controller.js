const bcrypt = require('bcrypt');
const { z } = require('zod');

const User = require('../models/User');
const { badRequest, unauthorized } = require('../utils/errors');
const { signAccessToken } = require('../utils/jwt');

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

async function signup(req, res, next) {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const exists = await User.findOne({ email }).select('_id').lean();
    if (exists) throw badRequest('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signAccessToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('_id name email passwordHash');
    if (!user) throw unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid email or password');

    const token = signAccessToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
}

module.exports = { signup, login, me };

