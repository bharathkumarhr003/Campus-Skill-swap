import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MongoDB connection error: MONGODB_URI is not defined in the .env file.");
            process.exit(1);
        }

        // Log a sanitized version of the URI to avoid exposing credentials
        const sanitizedUri = uri.replace(/:([^:]+)@/, ':****@');
        console.log(`Attempting to connect to MongoDB: ${sanitizedUri}`);

        const connectionInstance = await mongoose.connect(uri);
        console.log(
            `\n MongoDB connected successfully! Host: ${connectionInstance.connection.host} \n`
        );
    } catch (error) {
        console.error("MongoDB connection failed. Error: ", error.message);
        console.error("Please ensure your MONGODB_URI in the .env file is correct and that your IP address is whitelisted in MongoDB Atlas.");
        process.exit(1);
    }
};

export default connectDB;
