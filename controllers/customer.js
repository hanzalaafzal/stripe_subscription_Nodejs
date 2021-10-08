const Joi = require('joi')
const bcrypt = require('bcrypt')
require('dotenv').config();

const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)
const mongoose = require('../config/database');




async function addCustomerStripe(body){
  const param = {
    'email' : body.email,
    'name':body.name,
    'address' : {
      'line1': body.address,
      'city':body.city,
    }

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

async function saveCustomerDB(Model,body,customerId){

  const salt=bcrypt.genSaltSync(10)
  const hashedPassword=bcrypt.hashSync(body.password,salt)

  let customer = new Model({
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

const customerSchema = mongoose.Schema({
  name: { type:String, required:true },
  email: { type:String , required:true, unique:true },
  address: String,
  city: { type:String },
  customer_id: { type:String,required:true },
  password: { type:String }
})

module.exports.registration = (req,res) => {

  const validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    name: Joi.string().min(3).required(),
    address:Joi.string().required(),
    city:Joi.string().required(),
  });

  const validate = validationSchema.validate(req.body);

  if(validate.error){
    res.status(400).send(validate.error)

  }else{

     getAllCustomers(req.body.email)
    .then((value) => {
      if(value.data.length > 0){
        console.log('User exists')
        res.send({
          error:"user_exists"
        }).status(400)
      }else{
        addCustomerStripe(req.body)
        .then((value2) => {
          console.log('user created in Stripe')
          const customerModel = mongoose.model('customers',customerSchema)
          saveCustomerDB(customerModel,req.body,value2.id)
          .then((value3) => {
            res.send({
              status: 'ok',
              original: value3
            }).status(200)
          })
          .catch((err2) => {
            res.send(err2).status(500)
          })
        })
        .catch((err) =>{
          res.send({
            error: err
          }).status(400)
        })
      }

    })
    .catch((err) => {
      console.log('there')
      res.send(err).status(400);
    })

  }
}

module.exports.authentication = (req,res)
