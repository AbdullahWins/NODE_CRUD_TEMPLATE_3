const router = require("express").Router();
const { authorizeAdmin } = require("../middlewares/AuthorizeAdmin");

const {
  getAllBatches,
  getOneBatch,
  uploadBatchesFromCSV,
  addOneBatch,
  updateOneBatch,
  deleteOneBatchById,
} = require("../controllers/batchController");

router.get("/all", getAllBatches);
router.get("/find/:id", getOneBatch);
router.post("/bulk-upload", authorizeAdmin, uploadBatchesFromCSV);
router.post("/add", authorizeAdmin, addOneBatch);
router.patch("/update/:id", authorizeAdmin, updateOneBatch);
router.delete("/delete/:id", authorizeAdmin, deleteOneBatchById);

module.exports = router;
