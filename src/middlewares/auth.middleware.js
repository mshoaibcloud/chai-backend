import { ApiError } from "../utils/ApiError";
import {asyncHandler} from "../../utlis/asyncHandler";

import jwt from "jsonwebtoken"
import { User } from "../models/user.model";


// if res is not used ,then you can replace it with _
export const verifyJWT = asyncHandler(async(req,_,next)=>{
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        // 
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        
        //decorde for get information from jsonwebtoken    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
        //check
        if(!user){
            //NEXT_VIDEO: discuss about frontend
            throw new ApiError(401,"Invaild Access Token")
        }
    
        //
        req.user = user;
        next()
    
    } catch (error) {
        throw new ApiError(401,"Invalid access Token")
    }


})