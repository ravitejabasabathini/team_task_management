const Project = require('../models/Project');
const { forbidden, notFound } = require('../utils/errors');

async function loadProject(req, res, next) {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;
    if (!projectId) return next(notFound('Project not found'));

    const project = await Project.findById(projectId).populate('members.user', '_id name email').lean();
    if (!project) return next(notFound('Project not found'));

    const membership = (project.members || []).find((m) => String(m.user?._id || m.user) === String(req.user._id));
    if (!membership) return next(forbidden('You are not a member of this project'));

    req.project = project;
    req.projectRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
}

function requireProjectRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!allowed.includes(req.projectRole)) return next(forbidden('Insufficient role'));
    next();
  };
}

module.exports = { loadProject, requireProjectRole };

