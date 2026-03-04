const mongoose = require('mongoose');

const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Playlist name is required"],
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    coverImage:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2014/05/05/19/49/microphone-338481_1280.jpg"
    },
    creator:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User",
         required:[true,"Playlist creator is required"]
    },
    songs:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Song",
    }],
    isPublic:{
        type:Boolean,
        default:false
    },
    followers:{
        type:Number,
        default:0
    },
   collaborators:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User",
    }],
    
},{timestamps:true})

const Playlist=mongoose.model('Playlist',playlistSchema);
module.exports=Playlist