const express=require("express")
const {createAlbum,getAlbum,getAlbumById,updateAlbum,deleteAlbum,getNewReleasedAlbum}=require("../controller/album")
const {protect,isAdmin}=require("../middleware/auth")
const upload=require("../middleware/upload")
const albumRouter=express.Router()

//public route
albumRouter.get("/",getAlbum)
albumRouter.get("/new-release",getNewReleasedAlbum)
albumRouter.get("/:id",getAlbumById)


//private route
albumRouter.post("/",protect,isAdmin,upload.single("coverImage"),createAlbum)
albumRouter.put("/:id",protect,isAdmin,upload.single("coverImage"),updateAlbum)
albumRouter.delete("/:id",protect,isAdmin,deleteAlbum)


module.exports=albumRouter