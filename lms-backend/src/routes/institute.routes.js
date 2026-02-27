const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/institute.controller');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'institutes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, '-');
		cb(null, `${Date.now()}-${safeName}`);
	}
});

const upload = multer({ storage });

router.get('/', auth, role(['admin']), ctrl.list);
router.get('/:id', auth, role(['admin']), ctrl.getById);
router.post('/', auth, role(['admin']), upload.single('logo'), ctrl.create);
router.put('/:id', auth, role(['admin']), upload.single('logo'), ctrl.update);
router.put('/:id/assign-course', auth, role(['admin']), ctrl.assignCourseToInstitute);
router.delete('/:id/courses/:courseId', auth, role(['admin']), ctrl.removeCourseFromInstitute);
router.delete('/:id', auth, role(['admin']), ctrl.remove);

module.exports = router;
