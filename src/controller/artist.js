const asyncHandler=require("express-async-handler")
const statusCodes=require("http-status-codes")
const Artist=require("../models/Artist")
const Song=require("../models/Song")
const Album=require("../models/Album")
const uploadToCloudinary=require("../utils/cloudinaryUpload")


//desc--Create new Artist
//route--POST /api/v1/artist
const createArtist=asyncHandler(async(req,res)=>{
    try {
        if(!req.body)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Request body required")
        }
        const {name,bio,genres}=req.body
        if(!name||!bio||!genres)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("name , bio, genres is required")
            
        }
        const existingArtist=await Artist.findOne({name})
        if(existingArtist)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Artist is already exists")
        }
        let imgUrl="";
        if(req.file)
        {
            const result=await uploadToCloudinary(req.file.path,"spotify/artist")
            imgUrl=result.secure_url
        }
        const artist=await Artist.create({
            name,bio,genres,isVerified:true,image:imgUrl
        })
        res.status(statusCodes.CREATED).json(artist)
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//desc--Fetch all Artist
//route--POST /api/v1/artist?genre=Rock&search=John&page=1&limit=10
const getArtists=asyncHandler(async(req,res)=>{
    try {
        // console.log(req.query)
        const{genre,search,page=1,limit=10}=req.query
        let filter={};
        if(genre) {
            filter.genres={$in:[genre]}
        }  
        if(search)
        {
            filter.$or=[
                {name:{$regex:search, $options:"i"}},
                {bio:{$regex:search,$options:"i"}}
            ]
        }
        const count=await Artist.countDocuments(filter)
        let skip=(parseInt(page-1)*parseInt(limit))
        const artist=await Artist.find(filter)
        .sort({followers:-1})
        .limit(parseInt(limit))
        .skip(skip)
        res.status(statusCodes.OK).json({
            artist,
            page:parseInt(page),
            pages:Math.ceil(count/parseInt(limit)),
        totalArtists:count
    })
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch Artist by ID
const getArtistById=asyncHandler(async(req,res)=>{
    try {
        if(!req.params.id)
        {
            res.status(statusCodes)
            throw new Error("Id is required")
        }
        const artist=await Artist.findById(req.params.id)
        if(!artist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Invalid id")
        }
        res.status(statusCodes.OK).json(artist)
        
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Update Artist By ID
const updateArtist=asyncHandler(async(req,res)=>{
    try {
        const{name,bio,genres,isVerified}=req.body
        const artist=await Artist.findById(req.params.id)
        if(artist)
        {
            if(name)
            {
                artist.name=name||artist.name
            }
            if(bio)
            {
                artist.bio=bio||artist.bio
            }
            if(req.file)
            {
                const result=await uploadToCloudinary(req.file.path,"spotify/artist")
                artist.image=result.secure_url
            }
            if(genres)
            {
                artist.genres=genres||artist.genres
            }
            if(isVerified)
            {
                artist.isVerified=isVerified||artist.isVerified
            }
            const updatedArtist=await artist.save()
            res.status(statusCodes.OK).json(updatedArtist)
        }
        else{
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Artist Not Found")
        }
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Delete Artist and associated songs
const deleteArtist=asyncHandler(async(req,res)=>{
    try {
        const artist=await Artist.findById(req.params.id)
        if(!artist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Artist Not Found")
        }
        //delete all song by artist
        await Song.deleteMany({artist:artist._id})
        //delete all album by artist
        await Album.deleteMany({artist:artist._id})
        //delete Artist
        await artist.deleteOne()

        res.status(statusCodes.OK).json({message:"Artist removed"})
    
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Get top artist
const getTopArtist=asyncHandler(async(req,res)=>{
    try {
        const {limit}=req.query
        const artist=await Artist.find().sort({followers:-1}).limit(parseInt(limit))
        res.status(statusCodes.OK).json(artist)
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Get Artist top Songs
const getArtistTopSong=asyncHandler(async(req,res)=>{
    try {
        const {limit}=req.query
        const song=await Song.find({artist:req.params.id}).sort({plays:-1}).limit(parseInt(limit)).populate("album","title coverImage")
        console.log(req.params.id)
        if(song.length>0)
        {
            res.status(statusCodes.OK).json(song)
        }
        else{
            res.status(statusCodes.NOT_FOUND)
            throw new Error("No song found for this Artist")
        }
        
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})
module.exports={createArtist,getArtists,getArtistById,updateArtist,deleteArtist,getTopArtist,getArtistTopSong}