const Joi = require('joi')
require('dotenv').config();
const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)
const mongoose = require('../config/database');

async function addCard(body){
  const param = {
    'type' : 'card',
    'card' : {
      'number' : body.card,
      'exp_month' : body.exp_month,
      'exp_year' : body.exp_year,
      'cvc' : body.exp_cvc,
    }
  }
  const customer = await stripe.paymentMethods.create(param);
  return customer;
}

async function attachCard(id,customer_id){
  const attach= await stripe.paymentMethods.attach(id,{
    customer:customer_id
  })
  return attach;
}

module.exports.addPaymentMethod = (req,res) => {
  const cardValidation = Joi.object({
    card: Joi.string().min(16).max(16).regex(/^[0-9]{16}$/).required(),
    exp_month: Joi.string().min(2).max(2).regex(/^[0-9]{2}$/).required(),
    exp_year:Joi.string().min(4).max(4).regex(/^[0-9]{4}$/).required(),
    cvc: Joi.string().min(3).max(4).regex(/^[0-9]{3}$/).required()
  });

  const validate = cardValidation.validate(req.body);

  if(validate.error){
    res.send(validate.error).status(400)
  }else{
    addCard(req.body)
    .then((card_value) => {
      console.log('card saved')

      //now attach card to customer

      attachCard(card_value.id,req.customer.customer_id)
      .then((attachment) => {
        console.log('card attached')
        res.status(200).send({
          status:"card_saved",
        });
      }).catch((err) => {
        res.send(400).send(err)
      })

    })
    .catch((err) => {
      res.send(err).status(400)
    })
  }

}
