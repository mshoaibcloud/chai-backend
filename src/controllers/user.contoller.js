// 
import { asyncHandler } from "../../utils/asyncHandler.js"

//
import { ApiError } from "../../utils/ApiError.js"
// on behalf you , user call to db for data. 
import { User } from "../models/user.model.js"
// get data from 
import { uploadOnCloudinary } from "../../utils/cloudinary.js"
//
import { ApiResponse } from "../../utils/ApiResponse.js"

//method 
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
    // steps: algorithm
    //1-get user details from frontend
    //2-validation - check not empty
    //3-check if user already exists: username, id
    //4-check for images and avatar
    //5-upload them to cloudinary
    //6.at cloudinary, check avatar
    //7. create user object for all information-detail 
    //8. create entry in db
    //9.remove passward and refresh token field from response
    //10.check for user creation
    //11.return response.

    //1-get user details from frontend
    // deconstruct -get data from body or params or file
    const { username, fullName, email, password } = req.body

    console.log(body);

    console.log("email:", email);
    //if we get data from file, then goto router to upload the file.
    // if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    // }

    //Example-Advance logic for all valid
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "fullname is required")
    }
    // find the User into the db-data 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    //when we find ,then check 
    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists')
    }



    // multer provide the files with path of all types.?
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);

    console.log(req.files);

    // 1-way
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(coverImageLocalPath);
    //2-way
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // now we check it
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!")
    }

    //now upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // check it
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // you can also check coverImage -here

    // create user-object - and entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        // coverImage: coverImage ? coverImage.url : " ",
        coverImage: coverImage?.url || "",

        email,
        password,
        username: username.toLowerCase()

    })

    // find user with id and not 2-fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Somthing went wrong while registering the user")

    }
    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registed Successfully!")
    )

})


export { registerUser }