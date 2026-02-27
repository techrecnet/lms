const express = require('express');
const router = express.Router();
const progressCtrl = require('../controllers/progress.controller');
const auth = require('../middleware/auth.middleware');

// Get progress for a course
router.get('/courses/:courseId', auth, progressCtrl.getProgress);

// Mark content as complete
router.post('/courses/:courseId/topics/:topicId/complete', auth, progressCtrl.markTopicComplete);
router.post('/courses/:courseId/library-topics/:libraryTopicId/complete', auth, progressCtrl.markLibraryTopicComplete);
router.post('/courses/:courseId/questions/:questionId/complete', auth, progressCtrl.markQuestionComplete);

module.exports = router;
