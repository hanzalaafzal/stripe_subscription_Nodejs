const mongoose = require('mongoose')



mongoose.connect('mongodb://localhost:27017/subscriptions?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')
    .then((result) => console.log(`Connected: ${result}`))
    .catch((err) => console.log(err));





module.exports = mongoose;
