import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Interface for the decoded JWT payload
interface DecodedToken {
    _id: string;
    email: string;
    username: string;
    iat: number; // Issued at timestamp
    exp: number; // Expiry timestamp
}

// Custom Request type to include user property
export interface AuthRequest extends Request {
    user?: IUser;
}

export const verifyJWT = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get the access token from cookies or the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the token using the secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as DecodedToken;

        // Find the user in the database using the token's _id
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

/* 
If the person is logged in, they have an access token inside their cookies. 
This middleware retrieves the user from the database using that token and attaches the user to the req object, 
allowing access to the user in subsequent middleware or route handlers.
*/
