const MainRouter = require("express").Router();

//import routes
const defaultRoutes = require("./DefaultRoutes");
const AdminRouter = require("../AdminRoutes");
const UserRouter = require("../UserRoutes");
const batchRoutes = require("../batchRoutes");
const studentRoutes = require("../studentRoutes");

//routes
MainRouter.use(defaultRoutes);

//routes with prefixes
MainRouter.use("/admins", AdminRouter);
MainRouter.use("/users", UserRouter);
MainRouter.use("/batches", batchRoutes);
MainRouter.use("/students", studentRoutes);

module.exports = MainRouter;
