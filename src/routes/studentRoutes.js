const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");

const {
  getAllStudents,
  getOneStudent,
  getStudentsByCourseNameAndBatchNumber,
  getStudentsByBatchId,
  getStudentsByUploadTime,
  uploadStudentsFromCSV,
  addOneStudent,
  updateOneStudent,
  deleteOneStudentById,
} = require("../controllers/studentController");

router.get("/all", getAllStudents);
router.get("/find/:id", authorizeAdmin, getOneStudent);
router.get("/batch", getStudentsByCourseNameAndBatchNumber);
router.get("/batch/:batchId", getStudentsByBatchId);
router.get("/created/:createdAt", authorizeAdmin, getStudentsByUploadTime);
router.post("/bulk-upload", authorizeAdmin, uploadStudentsFromCSV);
router.post("/add", authorizeAdmin, addOneStudent);
router.patch("/update/:id", authorizeAdmin, updateOneStudent);
router.delete("/delete/:id", authorizeAdmin, deleteOneStudentById);

module.exports = router;
