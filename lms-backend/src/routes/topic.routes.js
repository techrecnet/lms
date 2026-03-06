const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/topic.controller');

router.get('/:topicId', auth, role(['admin']), ctrl.getById);
router.put('/:topicId', auth, role(['admin']), ctrl.updateTopic);

module.exports = router;
