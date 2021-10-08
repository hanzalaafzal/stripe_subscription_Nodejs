const express = require('express')
const authMiddleware = require('../middleware/jwt')
const router = express.Router()
const paymentMethod = require('../controllers/payment_method')

router.post('/api/v1/customer/payment_method',authMiddleware,paymentMethod.addPaymentMethod)

module.exports = router;
