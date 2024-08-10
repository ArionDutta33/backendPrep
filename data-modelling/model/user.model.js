import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    emai: {
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const user = mongoose.model("User", userSchema)
export const User = mongoose.model("User", userSchema)
