const Task = require('../models/Task');
const Project = require('../models/Project');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getDashboard(req, res, next) {
  try {
    const memberships = await Project.find({ 'members.user': req.user._id }).select('_id name').lean();
    const projectIds = memberships.map((p) => p._id);

    const now = new Date();
    const today = startOfToday();

    const [assigned, overdue, byStatus] = await Promise.all([
      Task.find({ project: { $in: projectIds }, assignee: req.user._id })
        .sort({ updatedAt: -1 })
        .limit(25)
        .populate('project', '_id name')
        .lean(),
      Task.countDocuments({
        project: { $in: projectIds },
        assignee: req.user._id,
        dueDate: { $lt: today },
        status: { $ne: 'DONE' },
      }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    for (const row of byStatus) {
      statusMap[row._id] = row.count;
    }

    res.json({
      summary: {
        projects: memberships.length,
        tasksByStatus: statusMap,
        myOverdue: overdue,
        serverTime: now.toISOString(),
      },
      myTasks: assigned.map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        project: t.project ? { id: t.project._id, name: t.project.name } : null,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };

