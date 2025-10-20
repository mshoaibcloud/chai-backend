// {} -if not default
import {Router} from "express";

// jata huwa muj se milta jana
import { registerUser } from "../controllers/user.contoller.js";

// inject
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
//register all routes here
// if simply register User-method
router.route("/register").post(registerUser)

// if we inject upload file into register User-method.
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






export default router