const dayjs = require('dayjs');
const Task = require('../models/Task');
const LookupValue = require('../models/LookupValue');
const buildTaskFilters = require('../utils/buildTaskFilters');

const toDateOrNull = (value) => (value ? dayjs(value).toDate() : undefined);

const createTask = async (req, res) => {
  const { name, workDate, person, project, milestone = 'None', genericActivity, plannedStart, plannedEnd, actualStart, actualEnd } =
    req.body;

  if (!name || !person || !project || !genericActivity || !workDate) {
    res.status(400);
    throw new Error('Missing required task fields');
  }

  const task = await Task.create({
    name: name.trim(),
    workDate: toDateOrNull(workDate),
    person: person.trim(),
    project: project.trim(),
    milestone: milestone?.trim() || 'None',
    genericActivity: genericActivity.trim(),
    plannedStart: toDateOrNull(plannedStart),
    plannedEnd: toDateOrNull(plannedEnd),
    actualStart: toDateOrNull(actualStart),
    actualEnd: toDateOrNull(actualEnd),
    createdBy: req.user.id,
    createdByName: req.user.displayName || req.user.username,
  });

  res.status(201).json(task);
};

const getTasks = async (req, res) => {
  const filters = buildTaskFilters(req.query);
  const tasks = await Task.find(filters)
    .sort({ workDate: -1, createdAt: -1 })
    .populate('createdBy', 'username displayName role');
  res.json(tasks);
};

const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('createdBy', 'username displayName role');
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const hasOwner = Boolean(task.createdBy);
  const isOwner = hasOwner && task.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if ((hasOwner && !isOwner && !isAdmin) || (!hasOwner && !isAdmin)) {
    res.status(403);
    throw new Error('You can only edit tasks you created');
  }

  const payload = {
    name: req.body.name?.trim() ?? task.name,
    workDate: toDateOrNull(req.body.workDate) ?? task.workDate,
    person: req.body.person?.trim() ?? task.person,
    project: req.body.project?.trim() ?? task.project,
    milestone: req.body.milestone?.trim() ?? task.milestone,
    genericActivity: req.body.genericActivity?.trim() ?? task.genericActivity,
    plannedStart: req.body.plannedStart ? toDateOrNull(req.body.plannedStart) : task.plannedStart,
    plannedEnd: req.body.plannedEnd ? toDateOrNull(req.body.plannedEnd) : task.plannedEnd,
    actualStart: req.body.actualStart ? toDateOrNull(req.body.actualStart) : task.actualStart,
    actualEnd: req.body.actualEnd ? toDateOrNull(req.body.actualEnd) : task.actualEnd,
  };

  Object.assign(task, payload);
  const updated = await task.save();
  res.json(updated);
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const hasOwner = Boolean(task.createdBy);
  const isOwner = hasOwner && task.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if ((hasOwner && !isOwner && !isAdmin) || (!hasOwner && !isAdmin)) {
    res.status(403);
    throw new Error('You can only delete tasks you created');
  }
  await task.deleteOne();
  res.json({ message: 'Task removed' });
};

const getTaskStats = async (req, res) => {
  const filters = buildTaskFilters(req.query);

  const baseMatchStage = [{ $match: filters }];

  const [summaryResult] = await Task.aggregate([
    ...baseMatchStage,
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $ifNull: ['$actualEnd', false] }, 1, 0],
          },
        },
        open: {
          $sum: {
            $cond: [{ $ifNull: ['$actualEnd', false] }, 0, 1],
          },
        },
      },
    },
  ]);

  const groupPipeline = (field) => [
    ...baseMatchStage,
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $ifNull: ['$actualEnd', false] }, 1, 0],
          },
        },
        open: {
          $sum: {
            $cond: [{ $ifNull: ['$actualEnd', false] }, 0, 1],
          },
        },
      },
    },
    { $sort: { count: -1 } },
  ];

  const [tasksByProject, tasksByPerson] = await Promise.all([
    Task.aggregate(groupPipeline('project')),
    Task.aggregate(groupPipeline('person')),
  ]);

  res.json({
    summary: {
      total: summaryResult?.total ?? 0,
      completed: summaryResult?.completed ?? 0,
      open: summaryResult?.open ?? 0,
    },
    tasksByProject: tasksByProject.map((item) => ({
      key: item._id || 'Unassigned',
      total: item.count,
      completed: item.completed,
      open: item.open,
    })),
    tasksByPerson: tasksByPerson.map((item) => ({
      key: item._id || 'Unassigned',
      total: item.count,
      completed: item.completed,
      open: item.open,
    })),
  });
};

const getTaskOptions = async (req, res) => {
  try {
    const mapLookupValues = async (type) => {
      const values = await LookupValue.find({ type }).sort({ value: 1 }).select('value -_id');
      return values.map((entry) => entry.value);
    };

    const unique = (...lists) => {
      const combined = [].concat(...lists.map((list) => (Array.isArray(list) ? list : [])));
      return [...new Set(combined.filter(Boolean))];
    };

    const [
      projects,
      people,
      milestones,
      genericActivities,
      lookupProjects,
      lookupPeople,
      lookupMilestones,
      lookupActivities,
    ] = await Promise.all([
      Task.distinct('project'),
      Task.distinct('person'),
      Task.distinct('milestone'),
      Task.distinct('genericActivity'),
      mapLookupValues('project'),
      mapLookupValues('person'),
      mapLookupValues('milestone'),
      mapLookupValues('activity'),
    ]);

    res.json({
      projects: unique(lookupProjects, projects),
      people: unique(lookupPeople, people),
      milestones: unique(lookupMilestones, milestones),
      genericActivities: unique(lookupActivities, genericActivities),
    });
  } catch (error) {
    console.error('Error in getTaskOptions:', error);
    res.status(500);
    throw error;
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getTaskOptions,
};

