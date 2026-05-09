const { z } = require('zod');

const Task = require('../models/Task');
const Project = require('../models/Project');
const { badRequest, forbidden, notFound } = require('../utils/errors');

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(5000).optional().default(''),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
});

async function listTasks(req, res, next) {
  try {
    const projectId = req.query.projectId;
    if (!projectId) throw badRequest('projectId is required');

    const project = await Project.findById(projectId).select('members.user').lean();
    if (!project) throw notFound('Project not found');
    const isMember = (project.members || []).some((m) => String(m.user) === String(req.user._id));
    if (!isMember) throw forbidden('You are not a member of this project');

    const status = req.query.status;
    const q = { project: projectId };
    if (status) q.status = status;

    const tasks = await Task.find(q)
      .sort({ updatedAt: -1 })
      .populate('assignee', '_id name email')
      .populate('createdBy', '_id name email')
      .lean();

    res.json({
      tasks: tasks.map((t) => ({
        id: t._id,
        projectId: t.project,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignee: t.assignee ? { id: t.assignee._id, name: t.assignee.name, email: t.assignee.email } : null,
        createdBy: { id: t.createdBy._id, name: t.createdBy.name, email: t.createdBy.email },
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const body = createTaskSchema.parse(req.body);

    const project = await Project.findById(body.projectId).select('members.user').lean();
    if (!project) throw notFound('Project not found');
    const isMember = (project.members || []).some((m) => String(m.user) === String(req.user._id));
    if (!isMember) throw forbidden('You are not a member of this project');

    const task = await Task.create({
      project: body.projectId,
      title: body.title,
      description: body.description,
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      dueDate: body.dueDate ?? null,
      assignee: body.assigneeId ?? null,
      createdBy: req.user._id,
    });

    res.status(201).json({ task: { id: task._id } });
  } catch (err) {
    next(err);
  }
}

function canEditTask({ projectRole, userId, task }) {
  if (projectRole === 'ADMIN') return true;
  if (String(task.createdBy) === String(userId)) return true;
  if (task.assignee && String(task.assignee) === String(userId)) return true;
  return false;
}

async function updateTask(req, res, next) {
  try {
    const patch = updateTaskSchema.parse(req.body);
    const task = await Task.findById(req.params.id).lean();
    if (!task) throw notFound('Task not found');

    const project = await Project.findById(task.project).select('members.user members.role').lean();
    if (!project) throw notFound('Project not found');
    const membership = (project.members || []).find((m) => String(m.user) === String(req.user._id));
    if (!membership) throw forbidden('You are not a member of this project');

    if (!canEditTask({ projectRole: membership.role, userId: req.user._id, task })) {
      throw forbidden("You can't edit this task");
    }

    const update = { ...patch };
    if ('assigneeId' in patch) update.assignee = patch.assigneeId;
    delete update.assigneeId;

    const updated = await Task.findByIdAndUpdate(task._id, { $set: update }, { new: true })
      .populate('assignee', '_id name email')
      .populate('createdBy', '_id name email')
      .lean();

    res.json({
      task: {
        id: updated._id,
        projectId: updated.project,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
        dueDate: updated.dueDate,
        assignee: updated.assignee
          ? { id: updated.assignee._id, name: updated.assignee.name, email: updated.assignee.email }
          : null,
        createdBy: { id: updated.createdBy._id, name: updated.createdBy.name, email: updated.createdBy.email },
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) throw notFound('Task not found');

    const project = await Project.findById(task.project).select('members.user members.role').lean();
    if (!project) throw notFound('Project not found');
    const membership = (project.members || []).find((m) => String(m.user) === String(req.user._id));
    if (!membership) throw forbidden('You are not a member of this project');

    if (membership.role !== 'ADMIN' && String(task.createdBy) !== String(req.user._id)) {
      throw forbidden("You can't delete this task");
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };

