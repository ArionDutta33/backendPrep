import dotenv from 'dotenv'; // Remove the extra space
import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { app } from './app.js';
app
connectDB().then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`server running at ${process.env.PORT}`)
    })

}).catch((error) => {
    console.log("mongodb connection failed", error)
})


dotenv.config({
    path: './env '
})


























// import express from "express"
// const app = express()
// (
//         async () => {
//             try {
//                 await mongoose.connect(process.env.URL)
//                 app.on("error", () => {
//                     console.log("err", error)
//                     throw error
//                 })
//                 app.listen(process.env.PORT, () => {
//                     console.log(`server listening on ${process.env.PORT}`)
//                 })
//             } catch (error) {
//                 console.log(error)
//             }
//         }
//     )()