const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');

router.get('/', payoutController.getAllPayouts);
router.get('/:id', payoutController.getPayoutById);
router.post('/', payoutController.createPayout);
router.put('/:id', payoutController.updatePayout);
router.put('/:id/complete', payoutController.completePayout);
router.delete('/:id', payoutController.deletePayout);

module.exports = router;