/**
 * chack to user not login -> if login return user
 * chack to user allso login -> if login return login message
 */
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

export const CheckUserLogin = asyncHandler(async (req, res, next) => {
  // This middleware checks if the user is logged in when performing user-related actions
  // such as updating user data, changing passwords, or working with events.

  try {
    // Check if cookies are present in the request
    if (!req.cookies) {
      throw new ApiError(400, "No cookies found, User not logged in");
    }

    // Check if both accessToken and refreshToken are present in the cookies
    if (!(req.cookies?.accessToken && req.cookies?.refreshToken)) {
      throw new ApiError(400, "User not logged in");
    }

    // If accessToken is not present, verify the refreshToken
    if (!req.cookies?.accessToken) {
      const refreshToken = req.cookies?.refreshToken;
      let decodeValue;
      try {
        // Verify the refreshToken using the secret key
        decodeValue = await jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (error) {
        throw new ApiError(500, "Unable to decode refresh token");
      }

      // If the refreshToken is invalid, throw an error
      if (!decodeValue) {
        throw new ApiError(400, "Invalid refresh token");
      }

      // Inform the user that their accessToken has expired and needs to be refreshed
      res.json({ Warning: "Your access token has expired, please refresh it" });

      // Set the userId from the decoded refreshToken
      req.userId = decodeValue.userId;
      return next();
    }

    // If accessToken is present, verify it
    const accessToken = req.cookies?.accessToken;
    let decodeValue;

    try {
      // Verify the accessToken using the secret key
      decodeValue = await jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (error) {
      throw new ApiError(500, "Unable to decode access token");
    }

    // If the accessToken is invalid, throw an error
    if (!decodeValue) {
      throw new ApiError(400, "Invalid access token");
    }

    // Set the userId from the decoded accessToken
    req.userId = decodeValue.userId;
    return next();
  } catch (error) {
    // Handle any errors that occur during the process
    throw new ApiError(500, error.message || "Unable to check user : ChackUserLogin middleware faild");
  }
});

export const CheckForLogin = asyncHandler(async (req, res, next) => {
    // This middleware checks if the user is already logged in.
    // If the user is already logged in, it throws an error.
  
    try {
      // Check if cookies are present in the request
      if (req.cookies) {
        // Check if either accessToken or refreshToken is present in the cookies
        if (req.cookies?.accessToken || req.cookies?.refreshToken) {
          throw new ApiError(400, "User already logged in, please check or clear cookies");
        }
      }
      // Proceed to the next middleware or route handler if no login cookies are found
      return next();
    } catch (error) {
      // Handle any errors that occur during the process
      throw new ApiError(500, error.message || "Unable to check login : chackForLogin middleware faild");
    }
  });
  