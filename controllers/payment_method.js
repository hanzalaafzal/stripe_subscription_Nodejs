const Joi = require('joi')
require('dotenv').config();
const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)



async function paymentMethod(customer){
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer,
    type: 'card',
  });
  return paymentMethods;
}



module.exports.getPaymentMethod = (req,res) => {

  console.log('reading payment method');
  paymentMethod(req.customer.customer_id)
  .then((method) => {
    res.status(200).send({
      method: method,
      customer:req.customer
    });
  })
  .catch((err) => {
    res.status(400).send({
      error: 'METH1'
    })
  })

}

async function methodUpdate(pm_id,body){
  console.log('updating method')
  const paymentMethod = await stripe.paymentMethods.update(
  pm_id,
  {
    card : {
      exp_month:body.exp_month,
      exp_year:body.exp_year
    }
  }
  );
  return paymentMethod;
}


module.exports.updatePaymentMethod = (req,res) => {
  methodUpdate(req.params.id,req.body)
  .then((method) => {
    res.status(200).send({
      result:method,
      customer:req.customer
    });
  })
  .catch((err) => {
    res.status(400).send({
      error: "METH2",
      err: err
    })
  })
}
