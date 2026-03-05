const express=require("express")
const Song=require("../models/Song")
const {createSong,getSong,getSongById,updateSong,deleteAlbum,getTopSong,getNewSong}=require("../controller/song")
const {protect,isAdmin}=require("../middleware/auth")
const upload=require("../middleware/upload")
const songRouter=express.Router()


//configure multer to upload multiple files
const songUpload=upload.fields([
    {name:"audio",maxCount:1},
    {name:"coverImage",maxCount:1}
])

//Public route
songRouter.get("/",getSong)
songRouter.get("/top",getTopSong)
songRouter.get("/new-releases",getNewSong)
songRouter.get("/:id",getSongById)

//Private route
songRouter.post("/",protect,isAdmin,songUpload,createSong)
songRouter.put("/:id",protect,isAdmin,songUpload,updateSong)
songRouter.delete("/:id",protect,isAdmin,deleteAlbum)

module.exports=songRouter