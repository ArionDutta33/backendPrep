import mongoose from "mongoose";
import { ApiError } from "../../utils/apierror.js"
import { ApiResponse } from "../../utils/apiresponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js"
import { uploadCloudinary } from "../cloudinary.js";
import { User } from '../model/user.model.js';
import jwt from 'jsonwebtoken';
//repeat syntax

//generate access and refresh tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()



        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }



    } catch (error) {
        throw new new ApiError(500, "Something went wrong while generating the refresh and access token")
    }
}

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImage = req.files.coverImage[0].path
    }

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

const loginUser = asyncHandler(async (req, res) => {
    //data from req.body
    //username or email based?
    //find the user
    //password check
    //access and refresh token
    //send cookie 
    const { email, username, password } = req.body
    if (!(username || !email)) {
        throw new ApiError(400, "Username or password is required")
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exists")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in sucessfully"
            )
        )

})

const logoutOut = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "  refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(
        200,
        {},
        "Password changed successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "user fetched successfully")
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fields are requrired")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullname,
            email: email
        }
    },
        {
            new: true
        }
    ).select("-password")
    res.status(200).json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }
    const avatar = await uploadCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    )
    return res.status(200).json(new ApiResponse(200, user, "avatar image updated successfully"))

})
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing")
    }
    const coverImage = await uploadCloudinary(avatarImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    )
    return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username missing")
    }
    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            $cond: {
                                if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                then: true,
                                else: false
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    subscriberCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]

    )
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "user channel fetched successfully"))
})


const getWatchHistory = asyncHandler(async (req, res) => {
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
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully"))
})
export {
    registerUser, loginUser, logoutOut, refreshAccessToken,
    changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory
}