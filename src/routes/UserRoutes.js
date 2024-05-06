const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");
const UserRouter = require("express").Router();

const {
  getOneUser,
  getAllUsers,
  loginUser,
  registerUser,
  updateUserById,
  sendPasswordResetOTP,
  validatePasswordResetOTP,
  updateUserPasswordByOTP,
  updateUserPasswordByOldPassword,
  deleteUserById,
} = require("../controllers/UserController");
const { loginRateLimiter } = require("../middlewares/RateLimiters");

UserRouter.get("/find/:id", authorizeAdmin, getOneUser);
UserRouter.get("/all", authorizeAdmin, getAllUsers);
UserRouter.post("/register", registerUser);
UserRouter.post("/login", loginRateLimiter, loginUser);
UserRouter.post("/send-otp", sendPasswordResetOTP);
UserRouter.post("/validate-otp", validatePasswordResetOTP);
UserRouter.patch("/reset", updateUserPasswordByOTP);
UserRouter.patch("/update/:id", authorizeAdmin, updateUserById);
UserRouter.patch("/resetpassword/:email", updateUserPasswordByOldPassword);
UserRouter.delete("/delete/:id", authorizeAdmin, deleteUserById);

module.exports = UserRouter;
