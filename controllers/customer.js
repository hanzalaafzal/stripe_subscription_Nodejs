const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)
const mongoose = require('../config/database');
const RegisterModel = require('../models/CustomerRegistration')
const LoginModel = require('../models/CustomerLogin')


async function addCard(body){
  const param = {
    'type' : 'card',
    'card' : {
      'number' : body.card_no,
      'exp_month' : body.exp_month,
      'exp_year' : body.exp_year,
      'cvc' : body.cvc,
    }
  }
  const customer = await stripe.paymentMethods.create(param);
  return customer;
}

async function doSubscribe(id,customer_id,payment_method){
  const subscription = await stripe.subscriptions.create({

  customer: customer_id,
  items : [
    {
      price: id
    },
  ],
  default_payment_method:payment_method
  });
  return subscription;
}

// async function attachCard(id,customer_id){
//   const attach= await stripe.paymentMethods.attach(id,{
//     customer:customer_id
//   })
//   return attach;
// }



async function addCustomerStripe(body,payment_id){
  const param = {
    'email' : body.email,
    'name':body.name,
    'address' : {
      'line1': body.address,
      'city':body.city,
    },
    'payment_method' : payment_id
  }
  const customer = await stripe.customers.create(param);
  return customer;
}

async function getAllCustomers(emails){
    const customer = await stripe.customers.list({
      email:emails
    });
    return customer;
}

async function saveCustomerDB(model,body,customerId){

  const salt=bcrypt.genSaltSync(10)
  const hashedPassword=bcrypt.hashSync(body.password,salt)
  let customer = new model({
    name: body.name,
    email: body.email,
    address: body.address,
    city: body.city,
    customer_id:customerId,
    password: hashedPassword
  });
  const result=await customer.save();
  return result;
}


module.exports.registration = (req,res) => {

  const validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    name: Joi.string().min(3).required(),
    address:Joi.string().required(),
    city:Joi.string().required(),
    card_no:Joi.string().min(16).max(16).regex(/^[0-9]{16}$/).required(),
    exp_month: Joi.string().min(2).max(2).regex(/^[0-9]{2}$/).required(),
    exp_year:Joi.string().min(4).max(4).regex(/^[0-9]{4}$/).required(),
    cvc: Joi.string().min(3).max(4).regex(/^[0-9]{3}$/).required(),
    prod_id: Joi.string().required()

  });

  const validate = validationSchema.validate(req.body);

  if(validate.error){
    res.status(400).send(validate.error)

  }else{


     getAllCustomers(req.body.email)
    .then((value) => {
      if(value.data.length > 0){
        console.log('User exists')
        res.status(400).send({
          error:"USEX1"
        })
      }else{

        addCard(req.body)
        .then((card_body) => {
          console.log('card saved in stripe')

          addCustomerStripe(req.body,card_body.id)
          .then((value2) => {
            console.log('user created in Stripe')

            saveCustomerDB(RegisterModel,req.body,value2.id)
            .then((value3) => {
              console.log('user saved in mongo db')

              doSubscribe(req.body.prod_id,value2.id,card_body.id)
              .then((sub_body) => {
                console.log('subscription completed')
                  res.status(200).send({
                    status: "ok",
                    body: sub_body
                  })
              })
              .catch((err_sub)=> {
                res.status(400).send({
                  error:'SUB1'
                })
              })

            })
            .catch((err2) => {
              res.status(500).send({
                error: "US2",
                err:err2
              })
            })
          })
          .catch((err) =>{
            res.status(400).send({
              error: "STRIPE1",
              err:err
            })
          })
        })
        .catch((err) => {
          res.status(400).send({
            error:'CARD1'
          })
        })

      }

    })
    .catch((err) => {
      console.log('Error getting users')
      res.status(400).send(err);
    })

  }
}

async function authenticateCustomer(body,res){

  let validationSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  });
  let validate = validationSchema.validate(body)
  if(validate.error){
    res.send(validate.error).status(400)
  }else{

    let user=LoginModel.findOne({
      email:body.email
    },(err,user) => {
      if(err) {res.status(401).send({error: 'CRD1'})}

      if(user){

        const validatePassword= bcrypt.compareSync(body.password,user.password);
        if(!validatePassword){
          res.status(401).send({
            error: 'CRD1'
          })
        }else{
          const token = jwt.sign({
            name: user.name,
            email: user.email,
            customer_id:user.customer_id,
          }, 'hanzala')

          res.send({
            status:'authenticated',
            token:token
          });
        }

      }else{
        res.status(401).send({
          error:"CRD1"
        });
      }
    })

  }
}

module.exports.authentication = (req,res) => {

authenticateCustomer(req.body,res)


}
