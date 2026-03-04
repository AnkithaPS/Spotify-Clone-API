const mongoose=require('mongoose');

const artistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Artist name is required"],
        trim:true
    },
    bio:{
       type:String,
       trim:true  
    },
    releaseDate:{
        type:Date,
        default:Date.now()
    },
    image:{
        type:String,
        default:"https://tse2.mm.bing.net/th/id/OIP.5jLxwiZz4wtInPHM9HmQZwHaEK?pid=Api&h=220&P=0"
    },
    songs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Song"
    }],
    genres:[{
        type:String,
    }],
    followers:{
        type:Number,
        default:0
    },
    albums:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Album"
    }],
    songs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Song"
    }],
    isVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const Artist=mongoose.model('Artist',artistSchema);
module.exports=Artist