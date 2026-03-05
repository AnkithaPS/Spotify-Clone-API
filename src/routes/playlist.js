const express=require("express")
const {createPlaylist,getPlaylist,getUserPlaylist,getPlaylistById,updatePlaylist,deletePlaylist,addSongsToPlaylist}=require("../controller/playlist")
const upload=require("../middleware/upload")
const {protect,isAdmin}=require("../middleware/auth")
const playlistRouter=express.Router();

//Public route
playlistRouter.get("/",getPlaylist)

//Private route
playlistRouter.post("/",protect,isAdmin,upload.single("coverImage"),createPlaylist)
playlistRouter.get("/:id",protect,getPlaylistById)
playlistRouter.get("/user/me",protect,getUserPlaylist)
playlistRouter.put("/:id/add-songs",protect,addSongsToPlaylist)
playlistRouter.put("/:id",protect,upload.single("coverImage"),updatePlaylist)
playlistRouter.delete("/:id",protect,deletePlaylist)


module.exports=playlistRouter