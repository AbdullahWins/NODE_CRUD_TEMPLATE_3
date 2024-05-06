// models/UserModel.js

const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const { UserLoginDTO, UserRegisterDTO } = require("../dtos/UserDTO");
const { generateToken } = require("../services/tokenHandlers/HandleJwt");
const { validateOTP } = require("../services/otpHandlers/HandleOTP");
const {
  hashPassword,
  comparePasswords,
} = require("../services/encryptionHandlers/HandleBcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value) => {
        // Validate email format
        return /\S+@\S+\.\S+/.test(value);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// static method for login
userSchema.statics.login = async function ({ email, password }) {
  try {
    const user = await this.findOne({ email }).exec();
    if (!user) {
      return { error: "User not found" };
    }

    const passwordMatch = await comparePasswords(password, user?.password);
    if (!passwordMatch) {
      return { error: "Invalid password" };
    }

    const token = generateToken(user?.email);
    const userDTO = new UserLoginDTO(user, token);

    return { user: userDTO };
  } catch (error) {
    return { error: error?.message };
  }
};

// static method for registration
userSchema.statics.register = async function ({ name, email, password }) {
  try {
    //check if the user already exists
    const existingUserCheck = await this.findOne({ email }).exec();
    if (existingUserCheck) {
      return { error: "User already exists" };
    }

    //hash the password
    const hashedPassword = await hashPassword(password);

    //create a new User instance
    const newUser = new this({ name, email, password: hashedPassword });

    //save the User to the database
    await newUser.save();

    //generate token
    const token = generateToken(newUser?.email);
    const userDTO = new UserRegisterDTO(newUser, token);

    return { user: userDTO };
  } catch (error) {
    return { error: error?.message };
  }
};

// Static method for updating user data
userSchema.statics.updateUserById = async function ({ id, updateData }) {
  try {
    const updatedUser = await this.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return { error: "Failed to update user" };
    }

    return { user: updatedUser };
  } catch (error) {
    return { error: error?.message };
  }
};

// Static method for sending OTP
userSchema.statics.updatePasswordByOTP = async function ({
  email,
  otp,
  newPassword,
}) {
  try {
    // Validate OTP
    const otpStatus = await validateOTP({ email, otp, Model: this });
    if (otpStatus.error) {
      return { error: otpStatus.error };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return { error: "No modifications were made" };
    }

    return updatedUser;
  } catch (error) {
    return { error: error?.message };
  }
};

// Static method for updating password by email
userSchema.statics.updatePasswordByEmail = async function ({
  email,
  oldPassword,
  newPassword,
}) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      return { error: "User not found" };
    }

    const passwordMatch = await comparePasswords(oldPassword, user.password);

    if (!passwordMatch) {
      return { error: "Invalid password" };
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await this.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    return { error: error?.message };
  }
};

userSchema.statics.deleteUserById = async function (id) {
  try {
    const result = await this.deleteOne({ _id: id });

    if (result?.deletedCount === 0) {
      return { error: `No user found to delete with this id: ${id}` };
    } else {
      return { message: `User deleted successfully with id: ${id}` };
    }
  } catch (error) {
    return { error: error?.message };
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
