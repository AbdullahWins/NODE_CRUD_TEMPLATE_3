const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const csv = require("csv-parser");
const fs = require("fs");

const batchSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  courseName: {
    type: String,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// add static method for batch count
batchSchema.statics.getBatchCount = async function () {
  try {
    const batchCount = await this.countDocuments();
    return batchCount;
  } catch (error) {
    throw error;
  }
};

// Add a static method for bulk upload
batchSchema.statics.uploadBatchesFromCSV = async function (filePath) {
  try {
    const batchesToInsert = [];

    // Read CSV file and process data
    const insertedBatches = await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          // Process data as needed
          const batch = new this({
            courseName: row.courseName || "",
            batchNumber: row.batchNumber || "",
            grade: row.grade || "",
            startTime: row.startTime || "",
            endTime: row.endTime || "",
          });
          // Append processed data to list
          batchesToInsert.push(batch);
        })
        .on("end", async () => {
          // Insert batches to MongoDB
          if (batchesToInsert.length > 0) {
            try {
              const insertedBatches = await this.insertMany(batchesToInsert);
              resolve(insertedBatches);
            } catch (error) {
              reject(error);
            }
          } else {
            resolve([]);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    return insertedBatches;
  } catch (error) {
    throw error;
  }
};

//create a new batch
batchSchema.statics.createNewBatch = async function (batchData) {
  try {
    const newBatch = new this(batchData);
    const savedBatch = await newBatch.save();
    return savedBatch;
  } catch (error) {
    throw error;
  }
};

//get all batch
batchSchema.statics.getAllBatches = async function () {
  try {
    const batches = await this.find();
    return batches;
  } catch (error) {
    throw error;
  }
};

//get single batch
batchSchema.statics.getBatchById = async function (batchId) {
  try {
    const batch = await this.findById(batchId);
    return batch;
  } catch (error) {
    throw error;
  }
};

//update batch
batchSchema.statics.updateBatchById = async function (batchId, updatedData) {
  try {
    const updatedBatch = await this.findByIdAndUpdate(
      (_id = batchId),
      updatedData,
      //return the updated document
      { new: true }
    );
    return updatedBatch;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
batchSchema.statics.deleteBatchById = async function (batchId) {
  try {
    const deletedBatch = await this.findByIdAndRemove(batchId);
    return deletedBatch;
  } catch (error) {
    throw error;
  }
};

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
