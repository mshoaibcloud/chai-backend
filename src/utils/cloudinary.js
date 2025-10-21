// upload your first assets via nodejs
import { v2 as cloudinary } from 'cloudinary'

import fs from "fs"
import { loadEnvFile } from 'process';

// CONFIGURE 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// middle
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload
        (localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully!
        // console.log("file is uploaded on cloudinary",
            // response.url);
            // after ok
            fs.unlinkSync(localFilePath)
            return response;

    } catch (error) {
        // remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath) //remove
        return null;
    }
}


export {uploadOnCloudinary}

 

// temporar-code
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/olympic_flag.jpg", { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); });
