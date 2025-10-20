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

//Cookies-ducuments-
app.use(cookieParser())

/**  2.middleware-next */
// before response we check-user is login , is admin




export {app}

