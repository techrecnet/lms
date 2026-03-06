const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/section.controller');

// Topic management
router.post('/:sectionId/topics', auth, role(['admin']), ctrl.createTopic);
router.put('/:sectionId/topics/reorder', auth, role(['admin']), ctrl.reorderTopics);
router.put('/:sectionId/topics/:topicId/move', auth, role(['admin']), ctrl.moveTopic);

// Library topic management
router.post('/:sectionId/library-topics', auth, role(['admin']), ctrl.addLibraryTopic);
router.put('/:sectionId/library-topics/reorder', auth, role(['admin']), ctrl.reorderLibraryTopics);
router.put('/:sectionId/library-topics/:topicLibraryId/move', auth, role(['admin']), ctrl.moveLibraryTopic);
router.delete('/:sectionId/library-topics/:topicLibraryId', auth, role(['admin']), ctrl.removeLibraryTopic);

// Question management
router.post('/:sectionId/questions', auth, role(['admin']), ctrl.addQuestion);
router.delete('/:sectionId/questions/:questionId', auth, role(['admin']), ctrl.removeQuestion);

// Section management
router.delete('/:sectionId', auth, role(['admin']), ctrl.deleteSection);

module.exports = router;
