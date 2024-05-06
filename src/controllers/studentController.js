// Controllers/StudentController.js

const Student = require("../models/StudentModel");
const { logger } = require("../services/logHandlers/HandleWinston");
const { validObjectId } = require("../services/validationHandlers/HandleObjectIdValidation");

//get all Student using mongoose
const getAllStudents = async (req, res) => {
  try {
    //perform query on database
    const students = await Student.getAllStudents();
    if (students?.length === 0) {
      return res.status(200).send([]);
    }
    logger.log("info", `Found ${students?.length} students`);
    return res.status(200).send(students);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server Error" });
  }
};

//get single Student using mongoose
const getOneStudent = async (req, res) => {
  try {
    const studentId = req?.params?.id;
    //object id validation
    if (!validObjectId(studentId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //perform query on database
    const student = await Student.getStudentById(studentId);
    if (!student) {
      return res.status(404).send({ message: "Student not found" });
    } else {
      logger.log("info", JSON.stringify(student, null, 2));
      return res.status(200).send(student);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//get students by batch number
const getStudentsByCourseNameAndBatchNumber = async (req, res) => {
  try {
    const { batchNumber, courseName } = req?.query;
    if (!batchNumber || !courseName) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    //perform query on database
    const students = await Student.getStudentsByCourseNameAndBatchNumber(
      courseName,
      batchNumber
    );
    if (!students) {
      return res.status(404).send({ message: "Students not found" });
    } else {
      logger.log("info", JSON.stringify(students, null, 2));
      return res.status(200).send(students);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//get students by batch id
const getStudentsByBatchId = async (req, res) => {
  try {
    const batchId = req?.params?.batchId;

    //perform query on database
    const students = await Student.getStudentsByBatchId(batchId);
    if (!students) {
      return res.status(404).send({ message: "Students not found" });
    } else {
      logger.log("info", JSON.stringify(students, null, 2));
      return res.status(200).send(students);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

//get students by upload time
const getStudentsByUploadTime = async (req, res) => {
  try {
    const createdAt = req?.params?.createdAt;

    //perform query on database
    const students = await Student.getStudentsByUploadTime(createdAt);
    if (!students) {
      return res.status(404).send({ message: "Students not found" });
    } else {
      logger.log("info", JSON.stringify(students, null, 2));
      return res.status(200).send(students);
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Server error" });
  }
};

const uploadStudentsFromCSV = async (req, res) => {
  try {
    const { batchId } = JSON.parse(req?.body?.data);
    if (!batchId) {
      return res.status(400).send({ message: "Missing required fields" });
    }
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

    // Use the static method of Student model for bulk upload
    const insertedStudents = await Student.uploadStudentsFromCSV({
      filePath,
      batchId,
    });
    console.log(`Inserted ${insertedStudents?.length} students`);
    return res.status(201).send(insertedStudents);
  } catch (error) {
    logger.log("error", `Error processing CSV file: ${error.message}`);
    return res.status(500).send({ message: "Failed to process CSV file" });
  }
};

//add new Student using mongoose
const addOneStudent = async (req, res) => {
  try {
    const { batchId, name, roll, designation, workPlace, phone, email } =
      JSON.parse(req?.body?.data);
    if (
      !batchId ||
      !name ||
      !roll ||
      !designation ||
      !workPlace ||
      !phone ||
      !email
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    //validate authority from middleware authentication
    const auth = req?.auth;
    if (!auth) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    //create new student object
    let updatedData = {
      batchId,
      name,
      roll,
      designation,
      workPlace,
      phone,
      email,
    };

    //add new student
    const result = await Student.createNewStudent(updatedData);
    if (result === null) {
      logger.log("error", "Failed to add student!");
      return res.status(500).send({ message: "Failed to add student!" });
    }
    logger.log("info", `Added a new student: ${result}`);
    return res.status(201).send(result);
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to add student!" });
  }
};

// update One student using mongoose
const updateOneStudent = async (req, res) => {
  try {
    const studentId = req?.params?.id;
    const data = req?.body?.data ? JSON.parse(req?.body?.data) : {};
    //object id validation
    if (!validObjectId(studentId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    let updatedData = { ...data };

    const updatedStudent = await Student.updateStudentById(
      studentId,
      updatedData
    );

    if (updatedStudent === null) {
      return res.status(404).send({ message: "Student not found" });
    }
    logger.log("info", `Updated student: ${updatedStudent}`);
    if (!updatedStudent) {
      return res.status(500).json({ error: "Failed to update student " });
    }
    return res.json({ success: true, updatedStudent });
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to update student " });
  }
};

//delete one student
const deleteOneStudentById = async (req, res) => {
  try {
    const studentId = req?.params?.id;
    //object id validation
    if (!validObjectId(studentId)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }

    //to perform multiple filters at once
    const filter = {
      _id: studentId,
    };
    //delete student
    const result = await Student.deleteOne(filter);
    if (result?.deletedCount === 0) {
      logger.log("error", `No student found with this id: ${studentId}`);
      return res
        .status(404)
        .send({ message: "No student found with this id!" });
    } else {
      logger.log("info", `student deleted: ${studentId}`);
      return res.status(200).send({
        message: `student deleted!`,
      });
    }
  } catch (error) {
    logger.log("error", `Error: ${error?.message}`);
    return res.status(500).send({ message: "Failed to delete student!" });
  }
};

module.exports = {
  getAllStudents,
  getOneStudent,
  getStudentsByCourseNameAndBatchNumber,
  getStudentsByBatchId,
  getStudentsByUploadTime,
  uploadStudentsFromCSV,
  addOneStudent,
  updateOneStudent,
  deleteOneStudentById,
};
