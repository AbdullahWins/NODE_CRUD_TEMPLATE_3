const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { initializeCors } = require("../cors/cors.config");
const { initializeMulter } = require("../multer/multer.config");
const { initializeHelmet } = require("../helmet/helmet.config");
const { initializeMonitoring } = require("../monitorings/prometheus.config");

// Load environment variables from .env file before other imports
dotenv.config({ path: path.join(process.cwd(), ".env") });

const configureApp = () => {
  // Initialize Express app
  const app = express();

  // Middleware for parsing URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Middleware to collect request duration
  app.use(initializeMonitoring);

  // Initialize helmet
  initializeHelmet(app);

  // Initialize CORS
  initializeCors(app);

  // Initialize Multer
  initializeMulter(app);

  return app;
};

module.exports = configureApp;
