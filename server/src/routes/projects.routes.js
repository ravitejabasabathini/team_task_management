const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { loadProject, requireProjectRole } = require('../middleware/projectAccess');
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  changeMemberRole,
} = require('../controllers/projects.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listProjects);
router.post('/', createProject);

router.get('/:id', loadProject, getProject);
router.patch('/:id', loadProject, requireProjectRole('ADMIN'), updateProject);
router.delete('/:id', loadProject, requireProjectRole('ADMIN'), deleteProject);

router.post('/:id/members', loadProject, requireProjectRole('ADMIN'), addMember);
router.delete('/:id/members/:userId', loadProject, requireProjectRole('ADMIN'), removeMember);
router.patch('/:id/members/:userId', loadProject, requireProjectRole('ADMIN'), changeMemberRole);

module.exports = router;

