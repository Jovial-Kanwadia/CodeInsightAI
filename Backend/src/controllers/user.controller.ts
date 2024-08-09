import { ApiError } from '../utils/ApiError.js';
import User, { IUser } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js'
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId: string): Promise<{ refreshToken: string, accessToken: string }> => {
    try {
        const user: IUser | null = await User.findById(userId) as IUser;
        if (!user) {
            throw new Error('User not found');
        }

        // Generate tokens using user's methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Store refresh token in the user document
        user.refreshToken = refreshToken;
        // Save user with validation turned off to avoid password validation, etc.
        await user.save({ validateBeforeSave: false });

        // Return tokens
        return { refreshToken, accessToken };
    } catch (error) {
        // Handle errors and throw an ApiError
        throw new ApiError(500, "Something went wrong while generating refresh or access token");
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if ([email, password, username].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      throw new ApiError(409, "User with this username or email already exists");
    }
    
    let avatarLocalPath: string | undefined;
    if (req.files && !Array.isArray(req.files) && req.files.avatar?.length > 0) {
      avatarLocalPath = req.files.avatar[0].path;
    }
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    let coverImageLocalPath: string | undefined;
    if (req.files && !Array.isArray(req.files) && req.files.coverImage?.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
  
    const user: IUser = await User.create({
      avatar: avatar,
      coverImage: coverImage,
      email,
      password,
      username: username,
    });
  
    const createdUser: IUser | null = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body
    if(!username && !email){
        throw new ApiError(400, "Username or Email is required")
    }

    const user: IUser | null = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect Password!")
    }

    // Generate access and refresh tokens
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id.toString());

    // Fetch the updated user without the password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true
    };
    // Send response with cookies and JSON payload
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
})

const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }, 
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})
  
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    // Extract the incoming refresh token from cookies or the request body
    const incomingRefreshToken: string | undefined = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        // Verify the incoming refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as { _id: string };

        // Find the user associated with the refresh token
        const user: IUser | null = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        // Check if the incoming refresh token matches the user's refresh token
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token has expired");
        }

        // Generate new access and refresh tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id.toString());

        // Options for setting cookies
        const options = {
            httpOnly: true,
            secure: true,
        };
        // Set new tokens in cookies and send the response
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while refreshing the access token");
    }
});

const changeCurrentPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body
    if(!oldPassword){
        throw new ApiError(401, "Enter your current password")
    }
    if(!newPassword){
        throw new ApiError(401, "Enter your new password")
    }

    const user: IUser | null = await User.findById(req.user?._id).select(" -refreshToken")
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect Old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    const userObject = user.toObject();
    delete userObject.password;

    return res
    .status(200)
    .json(new ApiResponse(200, userObject, "Password Changed Successfully!"))
})

const getCurrentUser = asyncHandler( async(req: AuthRequest, res: Response) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched SuccessFully"))
})

const updateUsername = asyncHandler( async(req: AuthRequest, res: Response) => {
    const { username } = req.body
    if(!username){
        throw new ApiError(400, "Enter New FullName")
    }

    const existingUser: IUser | null = await User.findOne({username}).select("-password -refreshToken")
    if(existingUser){
        throw new ApiError(400, "Username already taken")
    }
    
    const user: IUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Username Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file missing!");
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!newAvatar?.url) {
        throw new ApiError(401, "Error while updating Avatar image");
    }

    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete Old Avatar from Cloudinary
    if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
    }

    // Update user avatar with the entire response object
    user.avatar = newAvatar;
    await user.save();


    return res.status(200).json(new ApiResponse(200, user, "Avatar Image Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file missing!");
    }

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!newCoverImage?.url) {
        throw new ApiError(400, "Error while updating cover image");
    }

    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete Old Cover Image from Cloudinary
    if (user.coverImage?.public_id) {
        await deleteFromCloudinary(user.coverImage.public_id);
    }

    // Update user cover image with the entire response object
    user.coverImage = newCoverImage;
    await user.save();

    return res.status(200).json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
});



export { 
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateUsername,
    updateUserAvatar,
    updateUserCoverImage,
    refreshAccessToken,
    generateAccessAndRefreshToken, 
};

