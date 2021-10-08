const Joi = require('joi')
require('dotenv').config();
const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)

const subPlans=[
  {
    price:'price_1Ji0G7InoG7W9INwW0k2NNTI'
  },{
    price:'price_1Ji0FgInoG7W9INwS8UFq7bT',
  },{
    price:'price_1Ji0FEInoG7W9INwaxL3uCeM'
  }
];

async function doSubscribe(id,customer_id,payment_method){
  const subscription = await stripe.subscriptions.create({

  customer: customer_id,
  items : [
    subPlans[id],
  ],
  default_payment_method:payment_method
  });
  return subscription;
}

async function getPaymentMethods(customer_id){
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer_id,
    type: 'card',
  });
  return paymentMethods;
}

module.exports.doSubscribtion = (req,res) => {
  const validSchema= Joi.object({
    sub_id: Joi.number().required(),
  });
  const validate = validSchema.validate(req.body)
  if(validate.error){
    res.status(400).send(validate.error)
  }else{
    getPaymentMethods(req.customer.customer_id)
    .then((method) => {
      console.log('Retrieved Payment Method');
      doSubscribe(req.body.sub_id,req.customer.customer_id,method.data[0].id)
      .then((result) => {
        res.status(200).send(result)
        console.log('subscription completed')
      })
      .catch((err) => {
        res.status(400).send(err)
      })


    })
    .catch((err) => {
      res.status(400).send(err)
    })



  }
}
