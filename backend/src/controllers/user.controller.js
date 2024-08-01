/**
 * register
 * login
 * logout
 * update user profile
 * change user password
 * delete user
 */

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import GenerateAccessRefreshToken from "../utils/getAccessRefressTokens.js";

export const registerUser = asyncHandler(async (req, res) => {
  // Extract user details from the request body

  const { userName, fullName, email, password } = req.body;

  // Check if any of the required fields are empty
  if (
    [userName, fullName, email, password].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, "Data not received");
  }
  // Check if username already exists
  if (await User.findOne({ userName })) {
    throw new ApiError(409, "Username already exists");
  }

  let createdUser;

  // Save the user details in the database
  createdUser = await User.create({ userName, fullName, email, password });

  // Check if the user was successfully created
  if (!createdUser) {
    throw new ApiError(500, "User saving failed");
  }

  let searchNewUser;
  try {
    // Retrieve the newly created user from the database, excluding sensitive fields
    searchNewUser = await User.findById(createdUser._id).select(
      "-password -refreshToken -__v"
    );
  } catch (error) {
    // Handle errors during user retrieval
    throw new ApiError(500, error.message || "Unable to find user in database");
  }

  // Check if the user was successfully retrieved
  if (!searchNewUser) {
    throw new ApiError(404, "User not found");
  }

  // Send a success response with the newly registered user details
  return res
    .status(201)
    .json(new ApiResponse(201, searchNewUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  // Extract user details from the request body
  let { userName, password } = req.body;

  // Check if any of the required fields are empty
  if ([userName, password].some((field) => field?.toString().trim() === "")) {
    throw new ApiError(400, "Data not received");
  }
  
  let searchUser;
  try {
    // Find user by userName, excluding refreshToken and __v fields
    searchUser = await User.findOne({ userName }).select("-refreshToken -__v");
  } catch (error) {
    // Handle error if user search fails
    throw new ApiError(500, error || "Data finding failed");
  }

  // Check if user exists
  if (!searchUser) {
    throw new ApiError(404, "UserName does not exist");
  }

  // Verify if the provided password is correct
  if (!searchUser.isPasswordCorrect(password)) {
    throw new ApiError(500, "Incorrect Password");
  }

  // Generate access and refresh tokens for the user
  const { accessToken, refreshToken } =
    await GenerateAccessRefreshToken(searchUser);
  if ([accessToken, refreshToken].some((field) => field?.trim() === "")) {
    throw new ApiError(500, "Tokens not Generated");
  }

  let returnUser;
  try {
    // Update user with new refreshToken and lastLogin date
    returnUser = await User.findByIdAndUpdate(
      searchUser._id,
      {
        $set: {
          refreshToken: refreshToken,
          lastLogin: Date.now(), // Update last login date
        },
      },
      {
        new: true, // Return the updated document
      }
    ).select("-password -refreshToken -__v");
  } catch (error) {
    // Handle error if user update fails
    throw new ApiError(500, "Unable to update User data in database");
  }

  // Check if user update was successful
  if (!returnUser) {
    throw new ApiError(500, "User update failed");
  }

  // Set maxAge and other options for accessToken and refreshToken
  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  }; // 1 day in milliseconds
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  }; // 15 days in milliseconds

  // Send response with cookies and user data
  return res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, returnUser, "User login successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  // For logout, the user must be logged in. This is checked using middleware,
  // which returns userId from cookies, and we search for the user by this ID.

  const userId = req.userId;

  if (!userId) {
    throw new ApiError(400, error || "UserId not received");
  }

  let searchUser;
  try {
    // Find user by userId and update refreshToken, lastLogout, and lastSessionTime
    searchUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: null, // Clear the refresh token
          lastLogout: Date.now(), // Set the last logout time to current time
        },
      },
      { new: true } // Return the updated document
    ).select("-password -__v");
  } catch (error) {
    // Handle error if user update fails
    throw new ApiError(500, error.message || "Unable to Update User");
  }

  // Check if user update was successful
  if (!searchUser) {
    throw new ApiError(500, "User update failed");
  }

  // Set cookie options
  const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  };

  // Clear cookies and send response with user data
  return res
    .clearCookie("accessToken", accessTokenOptions)
    .clearCookie("refreshToken", refreshTokenOptions)
    .status(200)
    .json(new ApiResponse(200, searchUser, "User Logout successfully"));
});

export const updateEmail = asyncHandler(async (req, res) => {
  // For Update, the user must be logged in. This is checked using middleware,
  // which returns userId from cookies, and we search for the user by this ID.

  const { newEmail } = req.body;
  if (!newEmail) {
    throw new ApiError(400, error || "Not data received");
  }

  const userId = req.userId;
  if (!userId) {
    throw new ApiError(500, error || "UserId not received");
  }

  let updateUser;
  try {
    // Update the user's information
    updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { email: newEmail },
      },
      { new: true }
    ).select("-password -refreshToken -__v"); // Exclude sensitive fields
  } catch (error) {
    // Handle any errors that occur during the update
    throw new ApiError(500, "unable to update User");
  }

  // Check if the update was successful
  if (!updateUser) {
    throw new ApiError(500, error || "User Not updated");
  }

  // Return a successful response
  return res
    .status(200)
    .json(new ApiResponse(202, updateUser, "user email updated successfully"));
});

export const updateFullName = asyncHandler(async (req, res) => {
  // For Update, the user must be logged in. This is checked using middleware,
  // which returns userId from cookies, and we search for the user by this ID.

  const { newName } = req.body;
  if (!newName) {
    throw new ApiError(400, error || "Not data received");
  }

  const userId = req.userId;
  if (!userId) {
    throw new ApiError(500, error || "UserId not received");
  }

  let updateUser;
  try {
    // Update the user's information
    updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { fullName: newName },
      },
      { new: true }
    ).select("-password -refreshToken -__v"); // Exclude sensitive fields
  } catch (error) {
    // Handle any errors that occur during the update
    throw new ApiError(500, "unable to update User");
  }

  // Check if the update was successful
  if (!updateUser) {
    throw new ApiError(500, error || "User Not updated");
  }

  // Return a successful response
  return res
    .status(200)
    .json(
      new ApiResponse(202, updateUser, "User Full Name updated successfully")
    );
});

export const changePasswordForLoginUser = asyncHandler(async (req, res) => {
  // For changePassword, the user must be logged in. This is checked using middleware,
  // which returns userId from cookies, and we search for the user by this ID.

  const { newPassword } = req.body;
  if (!newPassword) {
    throw new ApiError(400, error || "Not receive NewPassword value");
  }

  const userId = req.userId;
  if (!userId) {
    throw new ApiError(500, error || "UserId not received");
  }

  let searchUser;
  try {
    // Find the user by their ID, excluding the password, refreshToken, and __v fields
    searchUser = await User.findById(userId).select(
      "-password -refreshToken -__v"
    );

  } catch (error) {
    throw new ApiError(500, "Enable to find User")
  }
  if(!searchUser){
    throw new ApiError(400, "User not Found")
  }
  let updateUser;
  try {
    
    // Update the user's password with the new password
    searchUser.password = newPassword;

    // Save the updated user information to the database
    await searchUser.save();

    // Retrieve the updated user information, selecting only the _id and password fields
    updateUser = await User.findById(searchUser._id).select("_id password");

  } catch (error) {
    // Handle any errors that occur during the update
    throw new ApiError(500, error || "Unable to updated Password");
  }

  // Check if the update was successful
  if (!updateUser) {
    throw new ApiError(500, error || "Password not updated");
  }

  // Return a successful response
  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "PassWord changes"));
});

export const changePasswordWithoutLogin = asyncHandler(async (req, res) => {
  // For changePassword, the user must be logged in. This is checked using middleware,
  // which returns userId from cookies, and we search for the user by this ID.

  const { userId, newPassword, oldPassword } = req.body;
  if (
    [userId, newPassword, oldPassword].some(
      (field) => field?.toString().trim() === ""
    )
  ) {
    throw new ApiError(400, error || "No data receive");
  }

  let searchUser;
  try {
    searchUser = await User.findById(userId).select(
      " -refreshToken -__v"
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Enable to find user");
  }
  if (!searchUser) {
    throw new ApiError(400, "user not found");
  }

  if (!searchUser.isPasswordCorrect(oldPassword)) {
    throw new ApiError(400, "Incorrect Old Password");
  }

  let updateUser;
  try {

     // Update the user's password with the new password
     searchUser.password = newPassword;

     // Save the updated user information to the database
     await searchUser.save();

    // Retrieve the updated user information, selecting only the _id and password fields
    updateUser = await User.findById(searchUser._id).select("_id password");
  } catch (error) {
    // Handle any errors that occur during the update
    throw new ApiError(500, error || "Unable to updated Password");
  }

  // Check if the update was successful
  if (!updateUser) {
    throw new ApiError(500, error || "Password not updated");
  }

  // Return a successful response
  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "PassWord changes"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  // Ensure the user is logged in and userId is available
  const userId = req.userId;
  if (!userId) {
    // If userId is not received, throw an error
    throw new ApiError(500, "UserId not received");
  }

  try {
    // Attempt to find and delete the user by userId
    await User.findByIdAndDelete(userId);
  } catch (error) {
    // If an error occurs during deletion, throw an error
    throw new ApiError(500, "Unable to delete User");
  }

  // Define cookie options for clearing cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  // Clear the refreshToken and accessToken cookies, and send a success response
  return res
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});
