const express = require('express')
const authMiddleware = require('../middleware/jwt')
const router = express.Router()
const paymentMethod = require('../controllers/payment_method')

router.get('/api/v1/customer/payment_method',authMiddleware,paymentMethod.getPaymentMethod)
router.post('/api/v1/customer/payment_method/update/:id',authMiddleware,paymentMethod.updatePaymentMethod)

module.exports = router;
