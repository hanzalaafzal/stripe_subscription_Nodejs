const express = require('express')
const router = express.Router();
const authMiddleware = require('../middleware/jwt')
const subscription = require('../controllers/subscription')

// router.post('/api/v1/subscribe',authMiddleware,subscription.doSubscribtion)
router.get('/api/v1/plans',subscription.getPlans)
router.get('/api/v1/plans/:plan',subscription.getPlan)
router.get('/api/v1/subscriptions',authMiddleware,subscription.getSubscriptions);

module.exports = router;
