const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/mentor.controller');

// More specific routes MUST come before parameterized routes

// Admin: list all mentors
router.get('/', auth, role(['admin']), ctrl.listMentors);
// Admin: create mentor
router.post('/', auth, role(['admin']), ctrl.createMentor);

// Admin: list assignments (optional batch filter)
router.get('/assignments', auth, role(['admin']), ctrl.listAssignmentsAdmin);
// Admin: create or update assignment
router.post('/assignments', auth, role(['admin']), ctrl.upsertAssignment);

// Mentor: list my assignments
router.get('/me/assignments', auth, role(['mentor']), ctrl.listMyAssignments);

// Mentor: course report
router.get('/reports/:batchId/:courseId', auth, role(['mentor']), ctrl.getMentorReport);

// Admin: get single mentor (must come after more specific routes)
router.get('/:id', auth, role(['admin']), ctrl.getMentor);
// Admin: update mentor
router.put('/:id', auth, role(['admin']), ctrl.updateMentor);
// Admin: delete mentor
router.delete('/:id', auth, role(['admin']), ctrl.deleteMentor);

module.exports = router;
