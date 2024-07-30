import ApiError from "./ApiError.js"

// Function to generate access and refresh tokens for a user
const GenerateAccessRefreshToken = async (user) => {
    try {
        // Generate access token
        const accessToken = await user.generateAccessToken()
        // Generate refresh token
        const refreshToken = await user.generateRefreshToken()
    
        // Return both tokens
        return { accessToken, refreshToken }
    } catch (error) {
        // Create a new ApiError instance with a status code and error message
        throw new ApiError(500, error.message || "Unable to generate access/refresh tokens")
    }
}

export default GenerateAccessRefreshToken