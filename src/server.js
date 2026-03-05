const express=require('express');
const mongoose=require('mongoose');
const userRoutes=require('./routes/user');
const artistRoutes=require("./routes/artist")
const albumRoutes=require("./routes/album")
const songRoutes=require("./routes/song")
const playlistRoutes=require("./routes/playlist")
const statusCodes=require('http-status-codes');
require('dotenv').config();

//Initialize express app
const app=express();

//Database connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.error('Error connecting to MongoDB',err.message);
})

//Pass incoming data
app.use(express.json());


//Routes
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/artist",artistRoutes);
app.use("/api/v1/album",albumRoutes);
app.use("/api/v1/song",songRoutes)
app.use("/api/v1/playlist",playlistRoutes)

//Middleware error handler
app.use((req,res,next)=>{
    const error=new Error("Not Found");
    error.status=statusCodes.NOT_FOUND;
    next(error);
})

//Global error handler
app.use((err,req,res,next)=>{
    res.status(err.status||statusCodes.INTERNAL_SERVER_ERROR).json({
        message:err.message||"Internal Server Error",
        status:"error"
    })

})
const PORT=process.env.PORT || 3000;
//Start server
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
