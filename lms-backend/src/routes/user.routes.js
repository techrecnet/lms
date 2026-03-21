const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/user.controller');

const upload = multer({ storage: multer.memoryStorage() });

// Profile routes (authenticated users)
router.get('/me', auth, ctrl.getMyProfile);
router.put('/me', auth, ctrl.updateMyProfile);
router.put('/me/password', auth, ctrl.changePassword);
router.post('/me/profile-image', auth, ctrl.uploadProfileImage.single('image'), ctrl.updateProfileImage);
router.get('/me/courses', auth, ctrl.getMyCourses);
router.post('/me/enroll', auth, ctrl.enrollInCourse);

// Admin routes
router.post('/', auth, role(['admin']), ctrl.createUser);
router.post('/upload-csv', auth, role(['admin']), upload.single('file'), ctrl.uploadUsersCsv);
router.get('/', auth, role(['admin']), ctrl.getUsers);
router.get('/:id', auth, role(['admin', 'mentor']), ctrl.getUserById);
router.get('/:id/progress', auth, role(['admin', 'mentor']), ctrl.getUserProgress);
router.put('/:id', auth, role(['admin']), ctrl.updateUser);
router.delete('/:id', auth, role(['admin']), ctrl.removeUser);
router.post('/:id/send-mail', auth, role(['admin']), ctrl.sendMailToUser);

module.exports = router;
