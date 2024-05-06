const User = require("../models/UserModel");
const {
  handleFileUpload,
} = require("../services/fileHandlers/HandleFileUpload");
const { sendOTP, validateOTP } = require("../services/otpHandlers/HandleOTP");
const { sendResponse } = require("../helpers/ResponseHelper");
const { asyncHandler } = require("../middlewares/AsyncHandler");
const { logger } = require("../services/logHandlers/HandleWinston");
const { hashPassword } = require("../services/encryptionHandlers/HandleBcrypt");
const {
  validObjectId,
} = require("../services/validationHandlers/HandleObjectIdValidation");

const loginUser = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email, password } = data;
  const result = await User.login({ email, password });
  if (result?.error) {
    let status = 401;
    if (result?.error === "User not found") {
      status = 404;
    }
    return sendResponse(res, status, result?.error);
  } else {
    logger.log("info", `User logged in: ${email}`);
    return sendResponse(res, 200, "User logged in successfully", result);
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = JSON.parse(req?.body?.data);
  const result = await User.register({ name, email, password });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    logger.log("info", `User registered: ${email}`);
    return sendResponse(res, 201, "User registered successfully", result);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    logger.log("info", `Found ${users.length} users`);
    return sendResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to retrieve users");
  }
};

const getOneUser = async (req, res) => {
  const userId = req?.params?.id;

  if (!validObjectId(userId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return sendResponse(res, 404, "User not found");
    } else {
      logger.log("info", JSON.stringify(user, null, 2));
      return sendResponse(res, 200, "User retrieved successfully", user);
    }
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to retrieve user");
  }
};

const updateUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!validObjectId(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const { files } = req;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { password, ...additionalData } = data;
  const folderName = "users";
  let updateData = {};

  if (files?.single) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.single,
      folderName,
    });
    const displayImage = fileUrls[0];
    updateData = { ...updateData, displayImage };
  }

  if (files?.multiple) {
    const fileUrls = await handleFileUpload({
      req,
      files: files?.multiple,
      folderName,
    });
    const coverImage = fileUrls[0];
    updateData = { ...updateData, coverImage };
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    updateData = { ...updateData, password: hashedPassword };
  }

  if (Object.keys(additionalData).length > 0) {
    updateData = { ...updateData, ...additionalData };
  }

  logger.log("info", JSON.stringify(updateData, null, 2));

  try {
    const updatedUser = await User.updateUserById({ id, updateData });

    return sendResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to update user");
  }
};

const sendPasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email } = data;
  const result = await sendOTP({ email, Model: User });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    return sendResponse(res, 200, result?.message);
  }
};

const validatePasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email } = data;
  const result = await validateOTP({ email, otp, Model: User });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    return sendResponse(res, 200, result?.message);
  }
};

// Update User password by OTP
const updateUserPasswordByOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email, newPassword } = data;

  const updatedUser = await User.updatePasswordByOTP({
    email,
    otp,
    newPassword,
  });

  if (updatedUser.error) {
    return sendResponse(res, 401, updatedUser.error);
  } else {
    return sendResponse(res, 200, "Password updated successfully");
  }
};

// Update User password by old password
const updateUserPasswordByOldPassword = async (req, res) => {
  const email = req?.params?.email;
  const data = JSON.parse(req?.body?.data);
  const { oldPassword, newPassword } = data;

  const updatedUser = await User.updatePasswordByEmail({
    email,
    oldPassword,
    newPassword,
  });

  if (updatedUser.error) {
    return sendResponse(res, 401, updatedUser.error);
  } else {
    return sendResponse(res, 200, "Password updated successfully", updatedUser);
  }
};

// Delete User by id using mongoose
const deleteUserById = async (req, res) => {
  const id = req?.params?.id;

  if (!validObjectId(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const deletionResult = await User.deleteUserById(id);

  if (deletionResult.error) {
    logger.log("error", deletionResult.error);
    return sendResponse(res, 404, deletionResult.error);
  } else {
    logger.log("info", deletionResult.message);
    return sendResponse(res, 200, deletionResult.message);
  }
};

module.exports = {
  getOneUser: asyncHandler(getOneUser),
  getAllUsers: asyncHandler(getAllUsers),
  updateUserById: asyncHandler(updateUserById),
  sendPasswordResetOTP: asyncHandler(sendPasswordResetOTP),
  validatePasswordResetOTP: asyncHandler(validatePasswordResetOTP),
  updateUserPasswordByOTP: asyncHandler(updateUserPasswordByOTP),
  loginUser: asyncHandler(loginUser),
  registerUser: asyncHandler(registerUser),
  updateUserPasswordByOldPassword: asyncHandler(
    updateUserPasswordByOldPassword
  ),
  deleteUserById: asyncHandler(deleteUserById),
};