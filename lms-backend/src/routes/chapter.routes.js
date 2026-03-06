const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/chapter.controller');

// nested: POST /chapters/:chapterId/topics
router.post('/:chapterId/topics', auth, role(['admin']), ctrl.createTopic);
router.put('/:chapterId', auth, role(['admin']), ctrl.updateChapter);
router.put('/:chapterId/topics/reorder', auth, role(['admin']), ctrl.reorderTopics);

// Library topics endpoints
router.post('/:chapterId/library-topics', auth, role(['admin']), ctrl.addLibraryTopic);
router.delete('/:chapterId/library-topics/:topicLibraryId', auth, role(['admin']), ctrl.removeLibraryTopic);

// Questions endpoints
router.post('/:chapterId/questions', auth, role(['admin']), ctrl.addQuestion);
router.delete('/:chapterId/questions/:questionId', auth, role(['admin']), ctrl.removeQuestion);

module.exports = router;
