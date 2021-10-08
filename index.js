const express = require('express')
const app =  express();
const customerRoutes = require('./routes/customer')
const paymentMethodRoutes = require('./routes/payment_method')


app.use(express.json());
app.use(customerRoutes);
app.use(paymentMethodRoutes);

app.listen(3000);
