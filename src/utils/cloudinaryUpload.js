const cloudinary=require("../config/cloudinary")
const fs=require("fs")

//upload local file to cloudinary
const uploadToCloudinary=async(filePath,folder)=>{
    try {
        const result=await cloudinary.uploader.upload(filePath,{
        folder,
        resource_type:"auto"
    })

    //delete the local file after upload
    fs.unlinkSync(filePath)
    return result;
    } catch (error) {
        if(fs.existsSync(filePath))
        {
            fs.unlinkSync(filePath)
        }
        throw new Error("Failed to upload file to cloudinary",error.message)
    } 
}

module.exports=uploadToCloudinary