import { Router } from "express";
import {
  changePasswordForLoginUser,
  changePasswordWithoutLogin,
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  updateEmail,
  updateFullName,
} from "../controllers/user.controller.js"; // Importing controller functions
import {
  CheckForLogin,
  CheckUserLogin,
} from "../middlewares/auth.middlewares.js"; // Importing authentication middlewares
import { RegenerateAccessToken } from "../middlewares/regenerateAccessoken.middleware.js"; // Importing middleware to regenerate access token

const userRouter = Router(); // Creating a new router instance

// Route to register a new user
userRouter.route("/register").post(CheckForLogin, registerUser);

// Route to login a user
userRouter.route("/login").post(CheckForLogin, loginUser);

// Route to logout a user
userRouter
  .route("/logout/:userId")
  .post(CheckUserLogin, RegenerateAccessToken, logoutUser);

// Route to update user information

userRouter
  .route("/updateEmail/:userId")
  .patch(CheckUserLogin, RegenerateAccessToken, updateEmail);

userRouter
  .route("/updateFullName/:userId")
  .patch(CheckUserLogin, RegenerateAccessToken, updateFullName);

// Route to change user password
userRouter
  .route("/changePasswordForLoginUser/:userId")
  .patch(CheckUserLogin, RegenerateAccessToken, changePasswordForLoginUser);

userRouter
  .route("/changePasswordWithoutLogin")
  .patch(changePasswordWithoutLogin);

// Route to delete a user
userRouter
  .route("/deleteUser/:userId")
  .delete(CheckUserLogin, RegenerateAccessToken, deleteUser);

export default userRouter; // Exporting the router to be used in other parts of the application
