const mongoose = require('../config/database');

const LoginSchema = {
  email: { type:String , required:true},
  password: { type:String }
}

const RegistrationSchema = {
  name: { type:String, required:true },
  email: { type:String , required:true, unique:true },
  address: String,
  city: { type:String },
  customer_id: { type:String,required:true },
  password: { type:String }
}

module.exports = mongoose.models.customers || mongoose.model('customers',LoginSchema)
