const jwt=require("jsonwebtoken")
const asyncHandler=require("express-async-handler")
const User=require("../models/User")
const statusCodes=require("http-status-codes")

//Check Authorization
const protect=asyncHandler(async(req,res,next)=>{
    let token;
    if(!req.headers.authorization)
    {
        res.status(statusCodes.UNAUTHORIZED)
        throw new Error("No token found in the header")
    }
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer"))
    {
        try{
            token=req.headers.authorization.split(" ")[1]
            //verify token
            const decode=jwt.verify(token,process.env.JWT)
            req.user=await User.findById(decode.id).select("-password")
            next();
        }catch(error)
        {
            res.status(statusCodes.UNAUTHORIZED)
            throw new Error("Unauthorized,token failed")
        }
    }
});

//Check if Admin
const isAdmin=asyncHandler(async(req,res,next)=>{
    if(req.user&&req.user.isAdmin)
    {
       next()
    }
    else{
        res.status(statusCodes.FORBIDDEN)
        throw new Error("Not Authorized as Admin")
    }
})

module.exports={protect,isAdmin}
