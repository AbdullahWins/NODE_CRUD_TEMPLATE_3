const { Timekoto } = require("timekoto");
const OTP = require("../../models/OtpModel");
const { logger } = require("../logHandlers/HandleWinston");
const { sendEmail } = require("../emailHandlers/HandleEmail");

//create a 4 digit OTP
const createOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
};

//save the otp to database
const saveOTP = async (email, otp) => {
  const existingOtp = await OTP.findOne({ email });
  if (existingOtp) {
    const expiresAt = Timekoto() + 60 * 3; // 3 mins in seconds
    const updatedOtp = await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { new: true }
    );
    return updatedOtp;
  } else {
    const newOtp = await OTP.create({ email, otp });
    return newOtp;
  }
};

//send the otp to the user
const sendOTP = async ({ email, Model }) => {
  try {
    //validate inputs
    if (!email) {
      return { error: "Email is required" };
    }
    const user = await Model.findOne({ email });
    const receiver = user?.email;
    if (!receiver) {
      return { error: `${Model.modelName} doesn't exist` };
    } else {
      //create and save the otp
      const otp = createOTP();
      const savedOtp = await saveOTP(receiver, otp);
      if (!savedOtp) {
        return { error: "Failed to send OTP" };
      }
      const subject = "Reset Your Password";
      const code = otp;
      //send the email
      const status = await sendEmail(receiver, subject, code);
      if (!status?.code === 200) {
        return { error: `${Model.modelName} doesn't exist` };
      }
      logger.log("info", `Password reset OTP sent to: ${receiver}`);
      return { message: "Password reset OTP sent successfully" };
    }
  } catch (error) {
    return { message: `Failed to reset ${Model.modelName} password` };
  }
};

//match the otp
const matchOTP = async (email, otp) => {
  const savedOtp = await OTP.findOne({ email: email });
  console.log(email, otp, savedOtp);
  if (savedOtp?.otp === otp) {
    if (savedOtp?.expiresAt > Timekoto()) {
      return { isMatch: true, message: "OTP matched!" };
    } else {
      return { isMatch: false, message: "OTP expired!" };
    }
  } else {
    return { isMatch: false, message: "OTP did not match!" };
  }
};

//validate the otp
const validateOTP = async ({ email, otp, Model }) => {
  try {
    //validate inputs
    if (!otp || !email) {
      return { error: "All fields are required" };
    }
    //check if the admin already exists
    const user = await Model.findOne({ email });
    if (!user) {
      return { error: `${Model.modelName} not found` };
    }
    //match the otp
    const otpMatch = await matchOTP(email, otp);
    if (!otpMatch?.isMatch) {
      return { error: otpMatch?.message };
    } else {
      return { message: otpMatch?.message };
    }
  } catch (error) {
    console.error(error?.message);
    return { message: `Failed to reset ${Model.modelName} password` };
  }
};

module.exports = { createOTP, saveOTP, sendOTP, matchOTP, validateOTP };
