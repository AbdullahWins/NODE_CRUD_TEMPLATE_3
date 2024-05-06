const configureApp = require("../config/server/configure.config.js");
const { kickstartServer } = require("../config/server/kickstart.config.js");
const MainRouter = require("./routes/main/mainRouter");

// Initialize Express app
const app = configureApp();

// Routes
app.use(MainRouter);

// Start the server
kickstartServer(app);
