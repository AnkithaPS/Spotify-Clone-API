const jwt=require("jsonwebtoken")

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT,{expiresIn:"2d"})
}

module.exports=generateToken