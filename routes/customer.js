const customerController = require('../controllers/customer')
const paymentMethodController = require('../controllers/payment_method')
const express = require('express')
const router = express.Router()

router.post('/api/v1/customer',customerController.registration)
router.post('/api/v1/customer/authenticate',customerController.authentication)



module.exports = router;
