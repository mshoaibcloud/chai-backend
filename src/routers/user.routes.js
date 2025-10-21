// {} -if not default
import {Router} from "express";

// jata huwa muj se milta jana-middleware
import { loginUser,logoutUser, registerUser,refreshAccessToken } from "../controllers/user.contoller.js";
// injections
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
//register all routes here
// if simply register User-method
router.route("/register").post(registerUser)

// This is a middleware: if we inject upload file into register User-method.
router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

//login 
router.route("/login").post(loginUser)

//logout : noted that you can add anotherMid if any
router.route("/logout").post(verifyJWT,logoutUser)

//newRefreshToken-endpoint
router.route("/refresh-token").post(refreshAccessToken) 


export default router