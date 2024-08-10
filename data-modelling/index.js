import express from "express"
const app = express()
import mongoose from "mongoose"
mongoose.connect("mongodb://127.0.0.1:27017/ecommerceDB").then(() => {
    console.log("done")
})
app.get("/", (req, res) => {
    res.send("hello")
})

app.listen(3000)