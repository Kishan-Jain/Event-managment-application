import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    const dataBaseUri = process.env.DATABASE_URI; // Get the database URI from environment variables
    const dbName = process.env.DATABASE_NAME; // Get the database name from environment variables
    
    const dbConnection = await mongoose.connect(`${dataBaseUri}/${dbName}`); // Connect to the database
    
    // Log a success message with the connection host
    console.log(`DataBase Connected Successfully. \nconnectionHost : ${dbConnection.connection.host}`);
  } catch (error) {
    // Throw an error if the database connection fails
    throw new ApiError(500, "DataBase Connection faild");
  }
};

export default connectDB;
