const mongoose = require("mongoose");
const { Timekoto } = require("timekoto");
const csv = require("csv-parser");
const fs = require("fs");

const studentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  roll: {
    type: Number,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  workPlace: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => {
      return Timekoto();
    },
  },
});

// Add a static method for counting students
studentSchema.statics.getStudentCount = async function () {
  try {
    const studentCount = await this.countDocuments();
    return studentCount;
  } catch (error) {
    throw error;
  }
};

// Add a static method for bulk upload
studentSchema.statics.uploadStudentsFromCSV = async function ({
  filePath,
  batchId,
}) {
  try {
    const studentsToInsert = [];

    // Read CSV file and process data
    const insertedStudents = await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          // Process data as needed
          const student = new this({
            batchId: batchId,
            name: row.name || "",
            roll: row.roll || "",
            designation: row.designation || "",
            workPlace: row.workPlace || "",
            phone: row.phone || "",
            email: row.email || "",
          });
          // Append processed data to list
          studentsToInsert.push(student);
        })
        .on("end", async () => {
          // Insert students to MongoDB
          if (studentsToInsert.length > 0) {
            try {
              const insertedStudents = await this.insertMany(studentsToInsert);
              resolve(insertedStudents);
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

    return insertedStudents;
  } catch (error) {
    throw error;
  }
};

//create a new student
studentSchema.statics.createNewStudent = async function (studentData) {
  try {
    const newStudent = new this(studentData);
    const savedStudent = await newStudent.save();
    // Populate the batchId field for the saved student
    await this.populate(savedStudent, { path: "batchId" });
    return savedStudent;
  } catch (error) {
    throw error;
  }
};

//get all Student
studentSchema.statics.getAllStudents = async function () {
  try {
    const students = await this.find().populate("batchId");
    return students;
  } catch (error) {
    throw error;
  }
};

//get single Student
studentSchema.statics.getStudentById = async function (studentId) {
  try {
    const student = await this.findById(studentId).populate("batchId");
    return student;
  } catch (error) {
    throw error;
  }
};

//get students by batch number
studentSchema.statics.getStudentsByCourseNameAndBatchNumber = async function (
  courseName,
  batchNumber
) {
  try {
    // Fetch all students
    const students = await this.find().populate("batchId");

    // Filter students by course name and batch number
    const studentsByBatchNumber = students.filter((student) => {
      return (
        student?.batchId?.courseName === courseName &&
        student?.batchId?.batchNumber === batchNumber
      );
    });

    return studentsByBatchNumber;
  } catch (error) {
    throw error;
  }
};

//get students by batch Id
studentSchema.statics.getStudentsByBatchId = async function (batchId) {
  try {
    const query = { batchId: batchId };
    console.log(`query`, query);
    const students = await this.find(query).populate("batchId");
    return students;
  } catch (error) {
    throw error;
  }
};

//get students by upload time
studentSchema.statics.getStudentsByUploadTime = async function (createdAt) {
  try {
    const students = await this.find({ createdAt: createdAt }).populate(
      "batchId"
    );
    return students;
  } catch (error) {
    throw error;
  }
};

//update Student
studentSchema.statics.updateStudentById = async function (
  studentId,
  updatedData
) {
  try {
    const updatedStudent = await this.findByIdAndUpdate(
      (_id = studentId),
      updatedData,
      //return the updated document
      { new: true }
    ).populate("batchId");
    return updatedStudent;
  } catch (error) {
    throw error;
  }
};

//delete ad service by id
studentSchema.statics.deleteStudentById = async function (studentId) {
  try {
    const deletedStudent = await this.findByIdAndRemove(studentId);
    return deletedStudent;
  } catch (error) {
    throw error;
  }
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
