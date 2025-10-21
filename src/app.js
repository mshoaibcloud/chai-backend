import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();



/** 1.app-configuration   */
// CORS documents-config
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

// Express-documents-configure
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

//Cookies parser-for access data study its documents
app.use(cookieParser())

/**  2.middleware-next */
// before response we check-user is login , is admin


//routes import
import userRouter from './routers/user.routes.js'

//routes declaration [app.get=>routes and controller-here]
//but now we get from other side, we used app.use().

// http://localhost:8000/users/user
// http://localhost:8000/users/login
// http://localhost:8000/users/api/v1/users/register

//routes decleation
app.use("/api/v1/users",userRouter) //activate
app.use("/users",userRouter) //activate


export {app}

