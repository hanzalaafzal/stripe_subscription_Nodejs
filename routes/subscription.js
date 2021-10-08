const express = require('express')
const router = express.Router();
const authMiddleware = require('../middleware/jwt')
const subscription = require('../controllers/subscription')

router.post('/api/v1/subscribe',authMiddleware,subscription.doSubscribtion)

module.exports = router;
