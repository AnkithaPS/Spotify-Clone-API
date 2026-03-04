const express=require('express');
const {registerUser,loginUser,getUserProfile,updateUserProfile}=require("../controller/user")
const {protect}=require("../middleware/auth")
const upload=require("../middleware/upload")
const userRouter=express.Router();

//public router
userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
//Private router
userRouter.get("/profile",protect,getUserProfile)
userRouter.put("/profile",protect,upload.single("profilePicture"),updateUserProfile)


module.exports=userRouter