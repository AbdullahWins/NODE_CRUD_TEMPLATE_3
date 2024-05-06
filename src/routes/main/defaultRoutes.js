// Init the default routes for the server
const express = require("express");
const path = require("path");
const router = require("express").Router();
const { getMetrics } = require("../../../config/monitorings/prometheus.config");
const { logger } = require("../../services/logHandlers/HandleWinston");

// Default route
router.get("/", (req, res) => {
  logger.log("info", "welcome to the server!");
  res.send("welcome to the server!");
});

// Expose metrics endpoint for Prometheus to scrape
router.get("/metrics", getMetrics);

// Serve uploaded files statically
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../../../uploads"))
);

module.exports = router;
