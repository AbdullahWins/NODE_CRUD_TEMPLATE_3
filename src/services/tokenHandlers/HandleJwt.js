const jwt = require("jsonwebtoken");
const { logger } = require("../logHandlers/HandleWinston");

const jwtSecret = process.env.JWT_SECRET_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN;

const generateToken = (payload) => {
  try {
    const token = jwt.sign({ email: payload }, jwtSecret, {
      expiresIn: expiresIn,
    });
    logger.log("info", "Token generated successfully");
    return token;
  } catch (error) {
    logger.log("error", `Error generating JWT token:: ${error?.message}`);
    throw new Error("Failed to generate JWT token");
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    logger.log("info", "Token decoded successfully");
    return decoded;
  } catch (error) {
    logger.log("error", `Error verifying JWT token:: ${error?.message}`);
    throw new Error("Failed to verify JWT token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
