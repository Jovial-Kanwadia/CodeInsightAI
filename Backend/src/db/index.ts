import mongoose, { ConnectOptions, Mongoose } from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance: Mongoose = await mongoose.connect(`${process.env.MONGODB_URI}${process.env.DB_NAME}`);
        console.log(`\nMongoDB connected DB Host: ${connectionInstance.connection.host}`);
        console.log(`Database Name: ${process.env.DB_NAME}`);
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

export default connectDB;
