const customerController = require('../controllers/customer')
const express = require('express')
const router = express.Router()

router.post('/api/v1/customer',customerController.registration)

module.exports = router;
