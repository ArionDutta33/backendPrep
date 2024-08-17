import { ApiError } from "../../utils/apierror.js"
import { ApiResponse } from "../../utils/apiresponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js"
import { uploadCloudinary } from "../cloudinary.js";
import { User } from '../model/user.model.js';
//repeat syntax

const registerUser = asyncHandler(async (req, res) => {
    //get user details from the front end
    //validation -not empty
    //check if user already exists -email or username
    //check for images and check for avatar
    //upload them to cloudinary, avatar
    //create a user object- create entry in db
    //remove password and refresh token field from response
    //chcek for user creation//if created return the response else return error

    const { fullname, email, username, password } = req.body
    //validation
    if (
        [fullname, email, username, password].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with email or username exists")
    }

    //handle files
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    //upload on cloduindary
    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    //create entry in db

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong when registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User regsitered sucessfully")
    )
})




export { registerUser }