const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { list, getById, create, update, remove, bulkImport } = require('../controllers/topiclibrary.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
router.post('/bulk', auth, role(['admin']), bulkImport);

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'audios');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'));
    }
  }
});

router.get('/', list);
router.get('/:id', getById);
router.post('/', auth, role(['admin']), upload.single('audio'), create);
router.put('/:id', auth, role(['admin']), upload.single('audio'), update);
router.delete('/:id', auth, role(['admin']), remove);

module.exports = router;
