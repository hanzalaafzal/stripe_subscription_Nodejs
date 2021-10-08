

const express = require('express')
const app =  express();
const customerRoutes = require('./routes/customer')
const paymentMethodRoutes = require('./routes/payment_method')
const subscribtionRoutes = require('./routes/subscription')


app.use(express.json());
app.use(customerRoutes);
app.use(paymentMethodRoutes);
app.use(subscribtionRoutes);

app.listen(3000);
