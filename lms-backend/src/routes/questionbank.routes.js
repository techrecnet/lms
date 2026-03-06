const express = require('express');
const router = express.Router();
const { list, getById, create, update, remove, exportCsv } = require('../controllers/questionbank.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', list);
router.get('/:id', getById);
router.post('/', auth, role(['admin']), create);
router.put('/:id', auth, role(['admin']), update);
router.delete('/:id', auth, role(['admin']), remove);

module.exports = router;
