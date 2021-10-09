const jwts = require('jsonwebtoken')
function auth(req,res,next){
  const token = req.header('x-auth-token')
  if(!token){
    res.status(401).send({
      error : 'jwt1'
    });
  }else{
    try{
        const decoded = jwts.verify(token,'hanzala')
        req.customer=decoded
        next();
    }catch(ex){
        res.status(500).send({
          error: 'jwt1'
        })
    }

  }
}


module.exports = auth
