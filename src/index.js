//  1-way-old as soon as possible import in app.
// require('dotenv').config({path:'./env'});
// console.log(process.env)


// 2-way-new fix it
import dotenv from "dotenv";

// second approach
import connectDB from './db/conn.js';

dotenv.config({
    path:'./.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONOGO db connection failed !!!",err);
})



/*
// first approach to connect the databas
import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';


// express for app
import express from "express"
import connectDB from './db/conn';
const app = express();

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror",(error)=>{
            console.log("ERROR:", 'error');
            throw error
        })

        // const port = process.env.PORT | 3000 

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log("ERROR:", 'error')
    }
})
*/    
