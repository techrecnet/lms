const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/course.controller');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'courses');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, '-');
		cb(null, `${Date.now()}-${safeName}`);
	}
});

const upload = multer({ storage });

// Public routes for landing page
router.get('/', ctrl.getCourses);
router.get('/:id', ctrl.getCourseById);

router.post('/', auth, role(['admin']), upload.single('image'), ctrl.createCourse);
router.put('/:id', auth, role(['admin']), upload.single('image'), ctrl.updateCourse);
router.put('/:id/sections/reorder', auth, role(['admin']), ctrl.reorderSections);
router.delete('/:id', auth, role(['admin']), ctrl.deleteCourse);

// nested
router.post('/:id/sections', auth, role(['admin']), ctrl.addSectionToCourse);

module.exports = router;
