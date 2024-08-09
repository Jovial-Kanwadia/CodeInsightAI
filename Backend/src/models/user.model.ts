import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
    username: string;
    email: string;
    avatar?: CloudinaryResponse;
    coverImage?: CloudinaryResponse;
    password: string;
    refreshToken?: string;

    // Methods
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

// Define Cloudinary response type
interface CloudinaryResponse {
    url: string;
    public_id: string;
    [key: string]: any;  // This allows for any additional properties Cloudinary might include
}

const userSchema: Schema<IUser> = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: Object,
    },
    coverImage: {
        type: Object
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(`Error comparing passwords: ${error.message}`);
    }
};

// Method to generate access token
userSchema.methods.generateAccessToken = function(): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
