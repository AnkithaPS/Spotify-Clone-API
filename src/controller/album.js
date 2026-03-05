const asyncHandler=require("express-async-handler")
const statusCodes=require("http-status-codes")
const uploadToCloudinary=require("../utils/cloudinaryUpload")
const Artist=require("../models/Artist")
const Album=require("../models/Album")
const Song=require("../models/Song")

//Create Album
const createAlbum=asyncHandler(async(req,res)=>{
    try {
        if(!req.body)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Request body data is required")
        }
        const{title,artistId,genre,description,releaseDate,isExplicit}=req.body
               

        if(!title||!artistId||!genre||!releaseDate||!description)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("title,artist,genre,releaseDate,description is required")
        }
        if(title.length<3||title.length>100)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Title must be between 3 and 100 characters")
        }
        if(description.length<10||description>200)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Description must be between 10 and 200 characters")
        }
        //Check if artist already exists
        const artist=await Artist.findById(artistId)
        if(!artist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Artist is not found")
        }
        //Check if album already exists
        const existingAlbum=await Album.findOne({title})
        if(existingAlbum)
        {
             res.status(statusCodes.BAD_REQUEST)
            throw new Error("Album is already exists")
        }
        let imgUrl;
        if(req.file)
        {   
            const result=await uploadToCloudinary(req.file.path,"spotify/albums")
            imgUrl=result.secure_url

        }

        //Create album
        const album=await Album.create({
            title,
            artist:artistId,
            releaseDate:releaseDate?new Date(releaseDate):Date.now(),
            genre,
            coverImage:imgUrl,
            description,
            isExplicit:isExplicit===true
        })

        //Add album to Artist's album
        artist.albums.push(album._id)
        await artist.save();

        res.status(statusCodes.CREATED).json(album)
    }
    catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})


//Get all the album
const getAlbum=asyncHandler(async(req,res)=>{
    try {
        // console.log(req.query)
        const{genre,artist,search,page=1,limit=10}=req.query
        let filter={};
        if(genre) {
            filter.genre=genre
        }  
        if(artist)
        {
            filter.artist=artist
        }
        if(search)
        {
            filter.$or=[
                {title:{$regex:search, $options:"i"}},
                {genre:{$regex:search,$options:"i"}},
                {description:{$regex:search,$options:"i"}}
            ]
        }
        //total album
        const count=await Album.countDocuments(filter)
        let skip=(parseInt(page-1)*parseInt(limit))
        const album=await Album.find(filter)
        .sort({releaseDate:-1})
        .limit(parseInt(limit))
        .skip(skip).populate("artist","name image")
        res.status(statusCodes.OK).json({
            album,
            page:parseInt(page),
            pages:Math.ceil(count/parseInt(limit)),
            totalAlbum:count
    })
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch Album by ID
const getAlbumById=asyncHandler(async(req,res)=>{
    try {
        if(!req.params.id)
        {
            res.status(statusCodes)
            throw new Error("Id is required")
        }
        const album=await Album.findById(req.params.id).populate("artist","name bio image").populate("songs","title")
        if(!album)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Album not found")
        }
        res.status(statusCodes.OK).json(album)
        
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Update Album By ID
const updateAlbum=asyncHandler(async(req,res)=>{
    try {
        const{title,genre,description,releaseDate,isExplicit}=req.body
        const album=await Album.findById(req.params.id)
        if(album)
        {
            if(title)
            {
                album.title=title||album.title
            }
            if(genre)
            {
                album.genre=genre||album.genre
            }
            if(releaseDate)
            {
                album.releaseDate=releaseDate||album.releaseDate
            }
            if(description)
            {
                album.description=description||album.description
            }
            
                album.isExplicit!==undefined?isExplicit==="true":album.isExplicit
            
            if(req.file)
            {
                const result=await uploadToCloudinary(req.file.path,"spotify/artist")
                album.coverImage=result.secure_url
            }
           
            const updatedAlbum=await album.save()
            res.status(statusCodes.OK).json(updatedAlbum)
        }
        else{
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Album Not Found")
        }
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Delete Album and associated songs
const deleteAlbum=asyncHandler(async(req,res)=>{
    try {
        const album=await Album.findById(req.params.id)
        if(!album)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Album Not Found")
        }
        //delete Album from Artist album
        await Artist.updateOne({_id:album.artist},{$pull:{albums:album._id}})
        //Update Song to remove album
        await Album.updateMany({album:album._id},{$unset:{album:1}})
        //delete Album
        await album.deleteOne()

        res.status(statusCodes.OK).json({message:"Album removed"})
    
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Get new released album 
const getNewReleasedAlbum=asyncHandler(async(req,res)=>{
    try {
        const {limit=10}=req.query
        const album=await Album.find().sort({releaseDate:-1}).limit(parseInt(limit))
        res.status(statusCodes.OK).json(album)
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})
module.exports={
    createAlbum,
    getAlbum,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    getNewReleasedAlbum
}