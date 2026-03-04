const express=require("express")
const {createArtist,getArtists,getArtistById,updateArtist,deleteArtist,getTopArtist,getArtistTopSong}=require("../controller/artist")
const {protect,isAdmin}=require("../middleware/auth")
const upload=require("../middleware/upload")
const artistRouter=express.Router()

//public route
artistRouter.get("/",getArtists)
artistRouter.get("/top",getTopArtist)
artistRouter.get("/:id/top-songs",getArtistTopSong)
artistRouter.get("/:id",getArtistById)
//private route
artistRouter.post("/",protect,isAdmin,upload.single("image"),createArtist)
artistRouter.put("/:id",protect,isAdmin,upload.single("image"),updateArtist)
artistRouter.delete("/:id",protect,isAdmin,deleteArtist)


module.exports=artistRouter