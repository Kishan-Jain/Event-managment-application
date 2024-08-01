import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

// Function to regenerate an access token
export const RegenerateAccessToken = asyncHandler(async (req, res, next) => {
    try {
        // by previous middleware we chack user logged or not and got userId 
        // so in this middleware work with regenrate access tokens
    
        // Check if userId is present in the request
        if (!req?.userId) {
          throw new ApiError(500, "Login middleware error: userId not passed");
        }
      
        let user;
        try {
          // Find the user by userId and exclude password and __v fields
          user = await User.findById(req?.userId).select("-password -__v");
        } catch (error) {
          // Handle error if user is not found
          throw new ApiError(500, error.message || "User not found");
        }
      
        // Generate a new access token for the user
        const accessToken = await user.generateAccessToken();
      
        // Check if access token generation failed
        if (!accessToken) {
          throw new ApiError(500, "Access token generation failed");
        }
      
        // Cookie options for the access token
        const accessTokenCookieOptions = {
          httpOnly: true, // Accessible only by the web server
          secure: true, // Sent only over HTTPS
          maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        };
      
        // Set the access token in a cookie
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        return next();
        
    } catch (error) {
        throw new ApiError(500, error.message || "Unable to regenate AccessToken : RegenrateAccessToken middleware faild")       
    }  
});
