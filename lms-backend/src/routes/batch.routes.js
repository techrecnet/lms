const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/batch.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, role(['admin']), ctrl.list);
router.get('/:id', auth, role(['admin']), ctrl.getById);
router.post('/', auth, role(['admin']), ctrl.createBatch);
router.put('/:id', auth, role(['admin']), ctrl.updateBatch);
router.put('/:id/assign-course', auth, role(['admin']), ctrl.assignCourseToBatch);
router.put('/:id/assign-student', auth, role(['admin']), ctrl.assignStudentToBatch);
router.post('/:id/upload-students-csv', auth, role(['admin']), upload.single('file'), ctrl.uploadStudentsCsv);
router.delete('/:id/students/:userId', auth, role(['admin']), ctrl.removeStudentFromBatch);
router.delete('/:id', auth, role(['admin']), ctrl.remove);

module.exports = router;
