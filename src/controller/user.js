const asyncHandler = require('express-async-handler');
const statusCodes = require('http-status-codes');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Artist=require("../models/Artist")
const Song=require("../models/Song")
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
    const user=await User.findById(req.user._id).select("-password")
    .populate("likedSongs","title artist duration")
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

//Toggle like/unlike Songs
const toggleLikeSong=asyncHandler(async(req,res)=>{
    try{
        const songId=req.params.songId
        const user=await User.findById(req.user._id)
        if(!user)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found")
        }
        const song=await Song.findById(songId)
        if(!song)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Song ID Not Found")   
        }
        //check if song is already liked
        const songIndex=user.likedSongs.indexOf(songId)
        //add liked song if not index found
        if(songIndex==-1)
        {
            user.likedSongs.push(songId)
            //increment the liked count of Song
            song.likes+=1
            song.save();
        }
        //remove if already liked
        else{
            user.likedSongs.splice(songIndex,1)
            //on unlike remove like count
            if(song.likes>0)
            {
                song.likes-=1
                song.save();
            }
            
        }
        await Promise.all([ user.save(),song.save()])
        res.status(statusCodes.OK).json({likedSongs:user.likedSongs,message:songIndex==-1?"Song added to liked songs":"Song removed from liked songs"})
    }catch(error)
    {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Toggle Follow/Unfollow Artist 
const toggleFollowArtist=asyncHandler(async(req,res)=>{
    try{
        const artistId=req.params.artistId
        const user=await User.findById(req.user._id)
        if(!user)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found")
        }
        const artist=await Artist.findById(artistId)
        if(!artist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Artist ID Not Found")   
        }
        //check if artist is already followed
        const artistIndex=user.followedArtists.indexOf(artistId)
        //add artist to followed if not found
        if(artistIndex==-1)
        {
            user.followedArtists.push(artistId)
            //increase the follow count of artist
            artist.followers+=1
            artist.save()
        }
        //unfollow artist if already followed
        else{
            user.followedArtists.splice(artistIndex,1)
            //decrease the follow count of artist
            if(artist.followers>0)
            {
                artist.followers-=1
                artist.save()
            }
            
        }
        await Promise.all([user.save(),artist.save()])
        res.status(statusCodes.OK).json({followedArtists:user.followedArtists,message:artistIndex==-1?"Artist followed":"Artist unfollowed"})
    }catch(error)
    {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Toggle Follow/Unfollow Playlist 
const toggleFollowPlaylist=asyncHandler(async(req,res)=>{
    try{
        const playlistId=req.params.playlistId
        const user=await User.findById(req.user._id)
        if(!user)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found")
        }
        const playlist=await Playlist.findById(playlistId)
        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist ID Not Found")   
        }
        //check if playlist is already followed
        const playlistIndex=user.followedPlaylists.indexOf(playlistId)
        //add playlist to followed if not found
        if(playlistIndex==-1)
        {
            user.followedPlaylists.push(playlistId)
            //increase the follow count of playlist
                playlist.followers+=1            
        }
        //unfollow playlist if already followed
        else{
            user.followedPlaylists.splice(playlistIndex,1)
            //decrease the follow count of playlist
            if(playlist.followers>0)
            {
                playlist.followers-=1
            }  
        }
        await Promise.all([user.save(),playlist.save()])
        res.status(statusCodes.OK).json({followedPlaylists:user.followedPlaylists,message:playlistIndex==-1?"Playlist Followed":"Playlist unfollowed"})
    }catch(error)
    {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})
module.exports={
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    toggleLikeSong,
    toggleFollowArtist,
    toggleFollowPlaylist
}