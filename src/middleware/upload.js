const multer=require("multer")
const path=require("path")

//configure storage for multer
const storage=multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,"uploads/")
    },
    filename:function(req,file,cb)
    {
        cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

//file filter to allow only audio and image files
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==="audio/mpeg" ||file.mimetype==="audio/wav")

        {
            cb(null,true)
        }
    else if(file.mimetype==="image/jpeg" ||file.mimetype==="image/png" ||file.mimetype==="image/jpg")

        {
            cb(null,true)
        }
    else{
        cb(new Error("Unsupported format..! only audio or image is supported"),false) 
    }
    
}

//Initialize multer
const upload=multer({
    storage:storage,
    limits:{fileSize:10*1024*1024}, //10MB max file size
    fileFilter
})

module.exports=upload