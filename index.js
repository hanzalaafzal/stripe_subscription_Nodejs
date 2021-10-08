const express = require('express')
const app =  express();
const customerRoutes = require('./routes/customer')


app.use(express.json());
app.use(customerRoutes);

app.listen(3000);
