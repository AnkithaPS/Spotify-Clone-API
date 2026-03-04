const asyncHandler = require('express-async-handler');
const statusCodes = require('http-status-codes');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const generateToken=require("../utils/generateToken");
const uploadToCloudinary = require('../utils/cloudinaryUpload');

//desc--Register new user
//route--POST /api/v1/users/login
const registerUser=asyncHandler(async(req,res)=>{
    try {
        const{name,email,password}=req.body;
        //check if user already exists
        const userExists=await User.findOne({email});
        if(userExists)
        {
             res.status(statusCodes.BAD_REQUEST)
             throw new Error("User already exists");
        }
        //Create new user
        const user=await User.create(
            {
            name,
            email,
            password
            })
            if(user)
            {
                res.status(statusCodes.CREATED)
                .json({
                _id:user._id,
                name:user.name,
                email:user.email,
                isAdmin:user.isAdmin,
                profilePicture:user.profilePicture,
            });
            }
           
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message});        
    }
})


//desc--user login
//route--POST /api/v1/users/register
const loginUser=asyncHandler(async(req,res)=>{
    try {
        const{email,password}=req.body;
        //check if user exists
        const user=await User.findOne({email})
        if (user&&await user.matchPassword)
        {
            res.status(statusCodes.OK).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                isAdmin:user.isAdmin,
                profilePicture:user.profilePicture,
                token:generateToken(user._id)
            })
            
        }else{
            res.status(statusCodes.UNAUTHORIZED)
            throw new Error("Invalid email/password")
        }
        
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message});
    }
})


//Get user profile
const getUserProfile=asyncHandler(async(req,res)=>{
    try{
    const user=await User.findById(req.user._id).select("-password").populate("likedSongs","title artist duration")
    .populate("likedAlbums","title artist releaseDate")
    .populate("followedArtists","name image")
    .populate("followedPlaylists","name creator coverImage")
    if(user){
        res.status(statusCodes.OK).json(user)
    }
    else{
        res.status(statusCodes.NOT_FOUND)
        throw new Error("User Not Found")
    }
    }catch(error)
    {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})


//Update user Profile
const updateUserProfile=asyncHandler(async(req,res)=>{
    try {
        
        const user=await User.findById(req.user._id)
        const {name,email,password}=req.body
        if(user)
        {
           user.name=name||user.name
           user.email=email||user.email
           //check password update
           if(password)
           {
            user.password=password
           }

           //check profile image upload
           if(req.file)
           {
            const result=await uploadToCloudinary(req.file.path,"spotify/users")
            user.profilePicture=result.secure_url
           }
           
           const updatedUser=await user.save();
           res.status(statusCodes.OK).json({
            _id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
            isAdmin:updatedUser.isAdmin,
            profilePicture:updatedUser.profilePicture
           })

        }
        else{
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found")
        }
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})
module.exports={registerUser,loginUser,getUserProfile,updateUserProfile}