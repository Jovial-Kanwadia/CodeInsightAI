import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

const unlinkAsync = promisify(fs.unlink);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    try {
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        
        // After uploading the image to Cloudinary, delete it from the local server
        await unlinkAsync(localFilePath);
        return response;
    } catch (error) {
        await unlinkAsync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(`Failed to delete file with public ID: ${publicId}`, error);
        throw new Error('Failed to delete file from Cloudinary');
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
};
