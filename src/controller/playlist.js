const asyncHandler=require("express-async-handler")
const statusCodes=require("http-status-codes")
const uploadToCloudinary=require("../utils/cloudinaryUpload")
const Artist=require("../models/Artist")
const Song=require("../models/Song")
const Playlist = require("../models/Playlist")
const User = require("../models/User")

//Create new playlist
const createPlaylist=asyncHandler(async(req,res)=>{
    try {
         if(!req.body)
            {
                res.status(statusCodes.BAD_REQUEST)
                throw new Error("Request body data is required")
            }
        const{name,description,isPublic}=req.body
        if(!name||!description){
            res.status(statusCodes.NOT_FOUND)
            throw new Error("name,description is required")
        }
        if(name.length<3||name.length>50){
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Name should be between 3 and 50 characters")
        }
        if(description.length<10||description.length>200){
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Description should be between 3 and 50 characters")
        }
        //Check if playlist already exists
        const existingPlaylist=await Playlist.findOne({name,creator:req.user._id})
        if(existingPlaylist)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Playlist already exists")
        }
        let imgUrl;
        if(req.file)
        {
            const result=await uploadToCloudinary(req.file.path,"spotify/playlist")
            imgUrl=result.secure_url
        }
        const playlist=await Playlist.create({
            name,
            description,
            creator:req.user._id,
            coverImage:imgUrl||undefined,
            isPublic:isPublic==="true",
        })
        res.status(statusCodes.CREATED).json(playlist)

        
    } catch (error) {
        res.statusMessage(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch all Playlist
const getPlaylist=asyncHandler(async(req,res)=>{
    try {
        const{search,page=1,limit=10}=req.query
        let filter={isPublic:true};//only public playlist
        if(search)
        {
            filter.$or=[
                {name:{$regex:search, $options:"i"}},
                {description:{$regex:search,$options:"i"}}
            ]
        }
        //total playlist
        const count=await Playlist.countDocuments(filter)
        let skip=(parseInt(page-1)*parseInt(limit))
        const playlist=await Playlist.find(filter)
        .sort({followers:-1})
        .limit(parseInt(limit))
        .skip(skip)
        .populate("creator","name profilePicture")
        .populate("collaborators","name profilePicture")
        res.status(statusCodes.OK).json({
            playlist,
            page:parseInt(page),
            pages:Math.ceil(count/parseInt(limit)),
            totalAlbum:count
    })
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch user playlist
const getUserPlaylist=asyncHandler(async(req,res)=>{
    try {

        const playlist=await Playlist.find({
            $or:[
                {creator:req.user._id},
                {collaborators:req.user._id}
            ]})
        .sort({createdAt:-1})
        .populate("creator","name profilePicture")        
        res.status(statusCodes.OK).json({playlist})
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch playlist by ID
const getPlaylistById=asyncHandler(async(req,res)=>{
    try {

        const playlist=await Playlist.findById(req.params.id)
        .populate("creator","name profilePicture")
        .populate("collaborators","name profilePicture") 
        if(!playlist)
            {
                res.status(statusCodes.NOT_FOUND)
                throw new Error("Playlist not found")
            }    
        //check if playlist is private and current user is not creator or collaborator
        if(!playlist.isPublic && !(req.user&&(playlist.creator.equals(req.user._id)||
        playlist.collaborators.some((collab)=>collab.equals(req.user._id)))))  
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("This Playlist is private")
        }
        res.status(statusCodes.OK).json({playlist})
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Update Playlist By ID
const updatePlaylist=asyncHandler(async(req,res)=>{
    try {
        const{name,description,isPublic}=req.body        
        const playlist=await Playlist.findById(req.params.id)
        if(playlist)
        {
            //check if user is creator or collaborator
            if(!playlist.creator.equals(req.user._id)&&!playlist.collaborators.some((collab)=>collab.equals(req.user._id)))
            {
                res.status(statusCodes.FORBIDDEN)
                throw new Error("Not authorized to update this playlist")
            }
            playlist.name=name||playlist.name
            playlist.description=description||playlist.description 
            //only creator can change privacy settings 
            if(playlist.creator.equals(req.user._id))
            {
                playlist.isPublic=isPublic!==undefined?isPublic==="true":playlist.isPublic
            }       
            
            if(req.file)
            {
                const result=await uploadToCloudinary(req.file.path,"spotify/playlist")
                playlist.coverImage=result.secure_url
            }
           
            const updatedPlaylist=await playlist.save()
            res.status(statusCodes.OK).json(updatedPlaylist)
        }
        else{
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist Not Found")
        }
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Delete Playlist
const deletePlaylist=asyncHandler(async(req,res)=>{
    try {
        const playlist=await Playlist.findById(req.params.id)
        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist Not Found")
        }
        //only creator can delete the playlist
        if(!playlist.creator.equals(req.user._id))
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("Not Authorized to delete this playlist")
        }
        await playlist.deleteOne()

        res.status(statusCodes.OK).json({message:"Playlist removed"})
    
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Add song to Playlist
const addSongsToPlaylist=asyncHandler(async(req,res)=>{
    try {
        const{songsId}=req.body;
        if(!songsId||!Array.isArray(songsId))
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("SongId's are required")
        }
        //find the playlist
        const playlist=await Playlist.findById(req.params.id)
        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist Not Found")
        }
        if(playlist.creator.equals(req.user._id)&&playlist.collaborators.some((collab)=>collab.equals(req.user._id)))
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("Not authorized to modify this playlist")
        }
        for(const songId of songsId)
        {

            //check if song exists
            const song=await Song.findById(songId)
            if(!song)
            {
                continue;
            }
            //check if song already in playlist
            if(playlist.songs.includes(songId))
            {
                continue;
            }

            //add songs to playlist
            playlist.songs.push(songId)

        }
        await playlist.save()
        res.status(statusCodes.OK).json({message:"Songs added to playlist"})
    
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Remove song from Playlist
const removeSongsFromPlaylist=asyncHandler(async(req,res)=>{
    try {
        //find the playlist
        const playlist=await Playlist.findById(req.params.id)
        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist Not Found")
        }
        if(playlist.creator.equals(req.user._id)&&playlist.collaborators.some((collab)=>collab.equals(req.user._id)))
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("Not authorized to modify this playlist")
        }
        const songsId=req.params.songId;
        //check if song is in playlist
        if(!playlist.songs.includes(songsId))
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("Song is not the playlist")
        }
        //remove song from playlist
        playlist.songs=playlist.songs.filter((id)=>id.toString()!==songsId)
        playlist.save()
        res.status(statusCodes.OK).json({message:"Song removed from playlist"})
    
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Add Collaborator
const addCollaborator=asyncHandler(async(req,res)=>{
    try {
        const userId=req.body.userId
        if(!userId)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("User Id is required")
        }
        //check if user exists
        const user=await User.findById(userId)
        if(!user)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found!")
        }
        //check if playlist exists
        const playlist=await Playlist.findById(req.params.id)

        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist not found!")
        }
        //only creator can add collaborator
        if(!playlist.creator.equals(req.user._id))
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("Not authorized to add collaborator")
        }
        //check if user is already in collaborator
        if(playlist.collaborators.includes(userId))
        {

            res.status(statusCodes.BAD_REQUEST)
            throw new Error("User is already a collaborator")
        }

        //add user to collaborator
        playlist.collaborators.push(userId)
        playlist.save()

        res.status(statusCodes.OK).json({message:"Collaborator is added"})
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Remove collaborator
const removeCollaborator=asyncHandler(async(req,res)=>{
    try {
        const userId=req.body.userId
        if(!userId)
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("User Id is required")
        }
        //check if user exists
        const user=await User.findById(userId)
        if(!user)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("User Not Found!")
        }
        //check if playlist exists
        const playlist=await Playlist.findById(req.params.id)

        if(!playlist)
        {
            res.status(statusCodes.NOT_FOUND)
            throw new Error("Playlist not found!")
        }
        //only creator can add collaborator
        if(!playlist.creator.equals(req.user._id))
        {
            res.status(statusCodes.FORBIDDEN)
            throw new Error("Only creator can remove collaborator")
        }
        //check if user is already in collaborator
        if(!playlist.collaborators.includes(userId))
        {
            res.status(statusCodes.BAD_REQUEST)
            throw new Error("User is not a collaborator")
        }

        //remove user from collaborator
        playlist.collaborators=playlist.collaborators.filter((id)=>id.toString()!==userId)
        playlist.save();

        res.status(statusCodes.OK).json({message:"Collaborator is removed"})
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})

//Fetch featured playlist
const getFeaturedPlaylist=asyncHandler(async(req,res)=>{
    try {
        const{limit=10}=req.query
        const filter={isPublic:true}
        const playlist=await Playlist.find(filter).sort({followers:-1})
        .limit(limit)
        .populate("creator","name profilePicture")
        res.status(statusCodes.OK).json(playlist)
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({message:error.message})
    }
})
module.exports={
    createPlaylist,
    getPlaylist,
    getUserPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongsToPlaylist,
    removeSongsFromPlaylist,
    addCollaborator,
    removeCollaborator,
    getFeaturedPlaylist
}