const { z } = require('zod');

const Project = require('../models/Project');
const User = require('../models/User');
const { badRequest, notFound } = require('../utils/errors');

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(''),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
});

const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

async function listProjects(req, res, next) {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .sort({ updatedAt: -1 })
      .select('_id name description members createdAt updatedAt')
      .lean();

    const shaped = projects.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      role: (p.members || []).find((m) => String(m.user) === String(req.user._id))?.role || 'MEMBER',
      memberCount: (p.members || []).length,
      updatedAt: p.updatedAt,
    }));

    res.json({ projects: shaped });
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description } = createProjectSchema.parse(req.body);

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'ADMIN' }],
    });

    res.status(201).json({ project: { id: project._id, name: project.name, description: project.description } });
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const p = req.project;
    res.json({
      project: {
        id: p._id,
        name: p.name,
        description: p.description,
        role: req.projectRole,
        members: (p.members || []).map((m) => ({
          user: { id: m.user._id, name: m.user.name, email: m.user.email },
          role: m.role,
          joinedAt: m.joinedAt,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const patch = updateProjectSchema.parse(req.body);
    const updated = await Project.findByIdAndUpdate(
      req.project._id,
      { $set: patch },
      { new: true }
    )
      .select('_id name description updatedAt')
      .lean();

    res.json({ project: { id: updated._id, name: updated.name, description: updated.description, updatedAt: updated.updatedAt } });
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    await Project.deleteOne({ _id: req.project._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const { email, role } = addMemberSchema.parse(req.body);
    const user = await User.findOne({ email }).select('_id name email').lean();
    if (!user) throw notFound('User not found');

    const exists = (req.project.members || []).some((m) => String(m.user?._id || m.user) === String(user._id));
    if (exists) throw badRequest('User is already a member');

    await Project.updateOne(
      { _id: req.project._id },
      { $push: { members: { user: user._id, role } } }
    );

    res.status(201).json({ member: { user: { id: user._id, name: user.name, email: user.email }, role } });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const userId = req.params.userId;
    if (String(userId) === String(req.user._id)) throw badRequest("You can't remove yourself");

    await Project.updateOne(
      { _id: req.project._id },
      { $pull: { members: { user: userId } } }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function changeMemberRole(req, res, next) {
  try {
    const userId = req.params.userId;
    const body = z.object({ role: z.enum(['ADMIN', 'MEMBER']) }).parse(req.body);

    if (String(userId) === String(req.user._id)) throw badRequest("You can't change your own role");

    const result = await Project.updateOne(
      { _id: req.project._id, 'members.user': userId },
      { $set: { 'members.$.role': body.role } }
    );

    if (result.matchedCount === 0) throw notFound('Member not found');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  changeMemberRole,
};

