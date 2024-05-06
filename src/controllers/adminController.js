const Admin = require("../models/AdminModel");
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

const loginAdmin = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email, password } = data;
  const result = await Admin.login({ email, password });
  if (result?.error) {
    let status = 401;
    if (result?.error === "Admin not found") {
      status = 404;
    }
    return sendResponse(res, status, result?.error);
  } else {
    logger.log("info", `Admin logged in: ${email}`);
    return sendResponse(res, 200, "Admin logged in successfully", result);
  }
};

const registerAdmin = async (req, res) => {
  const { name, email, password } = JSON.parse(req?.body?.data);
  const result = await Admin.register({ name, email, password });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    logger.log("info", `Admin registered: ${email}`);
    return sendResponse(res, 201, "Admin registered successfully", result);
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    logger.log("info", `Found ${admins.length} admins`);
    return sendResponse(res, 200, "Admins retrieved successfully", admins);
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to retrieve admins");
  }
};

const getOneAdmin = async (req, res) => {
  const adminId = req?.params?.id;

  if (!validObjectId(adminId)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  try {
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return sendResponse(res, 404, "Admin not found");
    } else {
      logger.log("info", JSON.stringify(admin, null, 2));
      return sendResponse(res, 200, "Admin retrieved successfully", admin);
    }
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to retrieve admin");
  }
};

const updateAdminById = async (req, res) => {
  const id = req?.params?.id;

  if (!validObjectId(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const { files } = req;
  const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
  const { password, ...additionalData } = data;
  const folderName = "admins";
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

  if (password) {
    const hashedPassword = await hashPassword(password);
    updateData = { ...updateData, password: hashedPassword };
  }

  if (Object.keys(additionalData).length > 0) {
    updateData = { ...updateData, ...additionalData };
  }

  logger.log("info", JSON.stringify(updateData, null, 2));

  try {
    const updatedAdmin = await Admin.updateAdminById({ id, updateData });

    return sendResponse(res, 200, "Admin updated successfully", updatedAdmin);
  } catch (error) {
    logger.log("error", error);
    return sendResponse(res, 500, "Failed to update admin");
  }
};

const sendPasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { email } = data;
  const result = await sendOTP({ email, Model: Admin });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    return sendResponse(res, 200, result?.message);
  }
};

const validatePasswordResetOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email } = data;
  const result = await validateOTP({ email, otp, Model: Admin });
  if (result?.error) {
    return sendResponse(res, 401, result?.error);
  } else {
    return sendResponse(res, 200, result?.message);
  }
};

// Update admin password by OTP
const updateAdminPasswordByOTP = async (req, res) => {
  const data = JSON.parse(req?.body?.data);
  const { otp, email, newPassword } = data;

  const updatedAdmin = await Admin.updatePasswordByOTP({
    email,
    otp,
    newPassword,
  });

  if (updatedAdmin.error) {
    return sendResponse(res, 401, updatedAdmin.error);
  } else {
    return sendResponse(res, 200, "Password updated successfully");
  }
};

// Update admin password by old password
const updateAdminPasswordByOldPassword = async (req, res) => {
  const email = req?.params?.email;
  const data = JSON.parse(req?.body?.data);
  const { oldPassword, newPassword } = data;

  const updatedAdmin = await Admin.updatePasswordByEmail({
    email,
    oldPassword,
    newPassword,
  });

  if (updatedAdmin.error) {
    return sendResponse(res, 401, updatedAdmin.error);
  } else {
    return sendResponse(
      res,
      200,
      "Password updated successfully",
      updatedAdmin
    );
  }
};

// Delete admin by id using mongoose
const deleteAdminById = async (req, res) => {
  const id = req?.params?.id;

  if (!validObjectId(id)) {
    return sendResponse(res, 400, "Invalid ObjectId");
  }

  const deletionResult = await Admin.deleteAdminById(id);

  if (deletionResult.error) {
    logger.log("error", deletionResult.error);
    return sendResponse(res, 404, deletionResult.error);
  } else {
    logger.log("info", deletionResult.message);
    return sendResponse(res, 200, deletionResult.message);
  }
};

module.exports = {
  getOneAdmin: asyncHandler(getOneAdmin),
  getAllAdmins: asyncHandler(getAllAdmins),
  updateAdminById: asyncHandler(updateAdminById),
  sendPasswordResetOTP: asyncHandler(sendPasswordResetOTP),
  validatePasswordResetOTP: asyncHandler(validatePasswordResetOTP),
  updateAdminPasswordByOTP: asyncHandler(updateAdminPasswordByOTP),
  loginAdmin: asyncHandler(loginAdmin),
  registerAdmin: asyncHandler(registerAdmin),
  updateAdminPasswordByOldPassword: asyncHandler(
    updateAdminPasswordByOldPassword
  ),
  deleteAdminById: asyncHandler(deleteAdminById),
};
