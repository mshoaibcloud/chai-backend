// 
import { asyncHandler } from "../utils/asyncHandler.js"

//
import { ApiError } from "../utils/ApiError.js"
// on behalf you , user call to db for data. 
import { User } from "../models/user.model.js"
// get data from 
import { uploadOnCloudinary } from "../utils/cloudinary.js"
//
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//methods 
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

// 
const loginUser = asyncHandler(async (req, res) => {
  //steps-todo
  //1.req body->data
  //2.username or email
  //3.find the user
  //4.check passward,access-jwt and refresh token genrate
  //5.send cookie-secure

  // 1-
  const { email, password, username } = req.body
  //2- || replace with &&
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  // if (!username || !email) {
  //     throw new ApiError(400,"username or email is required")
  // }
  //3- if you are registed,when I taken
  const user = User.findOne({
    //mongodb 
    $or: [{ username }, { email }]
  })
  // if you are not,then
  if (!user) {
    throw new ApiError(400, "User does not exists")
  }
  //4-
  const isPasswordVaild = await user.isPasswordCorrect(password)

  if (!isPasswordVaild) {
    throw new ApiError(400, "Invaild user credentials")
  }

  //then access and refresh -genrate Tokens
  const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId)
      const accessToken = user.genrateAccessToken
      const refreshToken = user.genrateRefreshToken

      // how we 
      user.refreshToken = refreshToken
      //save in database
      await user.save({ validateBeforeSave: false })
      //genrate
      return { accessToken, refreshToken }

    } catch (error) {
      throw new ApiError(400, "something wrong while generating access and refresh token")
    }

  }
  //deconstruct when method calls
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  // once again we call the database
  const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

  //last -send to cookie [when we secure: it is modify only server- not frontend]
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res.status(200)
    //access data from cookieParser
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    //send data json to cookies
    .json(
      new ApiResponse(
        200, {
        user: loggedInUser, accessToken, refreshToken
      },
        "User logged In Successfully"
      )
    )
})

//logout
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(req.user._id,
    {
      $set: { refreshToken: undefined }
    },
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"))
})

//endpoint-refreshAccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  // full Token-coded
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")

  }
  try {
    //here we require a decoded token not coded
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    //we create a db query to 
    const user = await User.findById(decodedToken?._id)

    //check
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token")
    }

    // matching both token
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or used")
    }

    //new methods -generated
    const options = {
      httpOnly: true,
      secure: true
    }

    // must be decoded
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)

      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken, newrefreshToken },
          "Access Token newRefresh"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid newRefeshToken")
  }
})

// change Current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  //if we get old and new password from body 
  const { oldPassword, newPassword } = req.body
  //const {oldPassword,newPassword,confPassword} = req.body
  // //incase of confirm passward
  // if(newPassword !== confPassword){
  //     throw new ApiError(400,"New password and confirm password do not match")
  // }



  // find user from db
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  //
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: true })

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  )


})

//if user login then 
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  return res.status(200)
    .json(200, req.user, "Current user profile fetched successfully")

})
// update user details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body

  if (!fullName || !email) {
    throw new ApiError(400, "fullname and email are required")
  }
  const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
    $set: { fullName, email }
  },
    { new: true, runValidators: true }
  ).select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User details updated successfully")
  )
})

// update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  // check
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  //TODO -delete old image from cloudinary-assignment


  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar")
  }

  const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
    $set: { avatar: avatar.url }
  },
    { new: true, runValidators: true }
  ).select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User avatar updated successfully")
  )
})
// update user coverImage
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  // check
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is required")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(500, "Something went wrong while uploading coverImage")
  }
  const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
    $set: { coverImage: coverImage.url }
  },
    { new: true, runValidators: true }
  ).select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User coverImage updated successfully")
  )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "username is required")
  }

  //pipline
  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() }
    },
    {
      $lookup: {
        from: "subscriptions", //lowercase plural 
        localField: "_id",
        foreignField: "channelId",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions", //lowercase plural 
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedChannels"
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        subscribedChannelsCount: { $size: "$subscribedChannels" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id || null, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedChannelsCount: 1,
        isSubscribed: 1,

        // password: 0, 
        // refreshToken: 0, 
        // subscribers: 0, 
        // subscribedChannels: 0
      }
    }

  ])

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found")
  }
  return res.status(200)
    .json(new ApiResponse(200, channel[0], "User channel profile fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async (req, res) => {
  // for frontend
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ]

      }
    }
  ])

  return res.status(200)
  .json(
    new ApiResponse(200, user[0].watchHistory,"Watch history featch successfully")
  )
})


export {
  registerUser, loginUser, logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,

}