const express=require('express');
const {registerUser,loginUser,
    getUserProfile,updateUserProfile,
    toggleLikeSong,toggleFollowArtist,
    toggleFollowPlaylist
}=require("../controller/user")
const {protect}=require("../middleware/auth")
const upload=require("../middleware/upload")
const userRouter=express.Router();

//public router
userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
//Private router
userRouter.get("/profile",protect,getUserProfile)
userRouter.put("/profile",protect,upload.single("profilePicture"),updateUserProfile)
userRouter.put("/liked-songs/:songId",protect,toggleLikeSong)
userRouter.put("/followed-artists/:artistId",protect,toggleFollowArtist)
userRouter.put("/followed-playlists/:playlistId",protect,toggleFollowPlaylist)

module.exports=userRouter