import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define the user schema
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true // Ensure username is unique
    },
    fullName: {
        type: String,
        required: true // Full name is required
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email is unique
    },
    password: {
        type: String,
        required: true // Password is required
    },
    lastLogin: {
        type: Date,
        default: undefined // Default value for last login
    },
    lastLogout: {
        type: Date,
        default: undefined // Default value for last logout
    },
    lastSessionTime: {
        type: String,
        default: undefined // Default value for last session time
    },
    refreshToken: {
        type: String,
        default: undefined // Default value for refresh token
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Hash the password before saving the user
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if the password is correct
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Create the User model from the schema
const User = model("User", userSchema);

export default User;
