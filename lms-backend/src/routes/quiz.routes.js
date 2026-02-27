const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const ctrl = require('../controllers/quiz.controller');

router.get('/', auth, role(['admin']), ctrl.list);
router.get('/:id', auth, role(['admin']), ctrl.getById);
router.post('/', auth, role(['admin']), ctrl.create);
router.put('/:id', auth, role(['admin']), ctrl.update);
router.delete('/:id', auth, role(['admin']), ctrl.remove);

module.exports = router;
