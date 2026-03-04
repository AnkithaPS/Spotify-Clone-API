const mongoose=require('mongoose');

const albumSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Album title is required"],
        trim:true
    },
    artist:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,"Artist is required"],
        ref:"Artist"    
    },
    releaseDate:{
        type:Date,
        default:Date.now()
    },
    coverImage:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2014/05/05/19/49/microphone-338481_1280.jpg"
    },
    songs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Song"
    }],
    genre:{
        type:String,
        trim:true
    },
    likes:{
        type:Number,
        default:0
    },
    description:{
        type:String,
        trim:true
    },
    isExplicit:{
        type:Boolean,
        default:false
    },
},{timestamps:true})

const Album=mongoose.model('Album',albumSchema);
module.exports=Album