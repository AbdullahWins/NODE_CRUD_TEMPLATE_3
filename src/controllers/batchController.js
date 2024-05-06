// Controllers/BatchController.js

const Batch = require("../models/BatchModel");
const Student = require("../models/StudentModel");
const { logger } = require("../services/logHandlers/HandleWinston");
const { validObjectId } = require("../services/validationHandlers/HandleObjectIdValidation");

//get all Batch using mongoose
const getAllBatches = async (req, res) => {
  try {
    //perform query on database
    const batches = await Batch.getAllBatches();
    if (batches?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${batches?.length} batches`);
    return res.status(200).send(batches);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single Batch using mongoose
const getOneBatch = async (req, res) => {
  try {
    const batchId = req?.params?.id;
    //object id validation
    if (!validObjectId(batchId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    //perform query on database
    const batch = await Batch.getBatchById(batchId);
    if (!batch) {
      return res.status(404).send({ message: "batch not found" });
    } else {
      //get students by batch Id
      const students = await Student.getStudentsByBatchId(batchId);
      const updatedData = { ...batch._doc, studentCount: students?.length };
      logger.log("info", JSON.stringify(updatedData, null, 2));
      return res.status(200).send(updatedData);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

const uploadBatchesFromCSV = async (req, res) => {
  try {
    // Check if file is provided in request
    if (!req.files || !req.files[0]) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    //validate authority from middleware authentication
    const auth = req?.auth;
    if (!auth) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const filePath = req.files[0].path;

    // Use the static method of batch model for bulk upload
    const insertedBatches = await Batch.uploadBatchesFromCSV(filePath);
    console.log(`Inserted ${insertedBatches?.length} batches`);
    return res.status(201).send(insertedBatches);
  } catch (error) {
    logger.log("error", `Error processing CSV file: ${error.message}`);
    return res.status(500).send({ message: "Failed to process CSV file" });
  }
};

//add new Batch using mongoose
const addOneBatch = async (req, res) => {
  try {
    const { courseName, batchNumber, grade, startTime, endTime } = JSON.parse(
      req?.body?.data
    );
    if (!batchNumber || !courseName || !grade || !startTime || !endTime) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    //validate authority from middleware authentication
    const auth = req?.auth;
    if (!auth) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    //create new batch object
    let updatedData = { courseName, batchNumber, grade, startTime, endTime };

    //add new batch
    const result = await Batch.createNewBatch(updatedData);
    if (result === null) {
      logger.log("error", "Failed to add batch!");
      return res.status(500).send({ message: "Failed to add batch!" });
    }
    logger.log("info", `Added a new batch: ${result}`);
    return res.status(201).send(result);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add batch!" });
  }
};

// update One batch using mongoose
const updateOneBatch = async (req, res) => {
  try {
    const batchId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};

    //object id validation
    if (!validObjectId(batchId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    let updatedData = { ...data };

    const updatedBatch = await Batch.updateBatchById(batchId, updatedData);
    if (updatedBatch === null) {
      return res.status(404).send({ message: "Batch not found" });
    }
    logger.log("info", `Updated batch: ${updatedBatch}`);
    if (!updatedBatch) {
      return res.status(500).json({ error: "Failed to update batch" });
    }
    return res.json({ success: true, updatedBatch });
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to update batch" });
  }
};

//delete one batch
const deleteOneBatchById = async (req, res) => {
  try {
    const batchId = req?.params?.id;
    //object id validation
    if (!validObjectId(batchId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: batchId,
    };
    //delete batch
    const result = await Batch.deleteOne(filter);
    if (result?.deletedCount === 0) {
      logger.log("error", `No batch found with this id: ${batchId}`);
      return res.status(404).send({ message: "No batch found with this id!" });
    } else {
      logger.log("info", `batch deleted: ${batchId}`);
      return res.status(200).send({
        message: `batch deleted!`,
      });
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to delete batch!" });
  }
};

module.exports = {
  getAllBatches,
  getOneBatch,
  uploadBatchesFromCSV,
  addOneBatch,
  updateOneBatch,
  deleteOneBatchById,
};
