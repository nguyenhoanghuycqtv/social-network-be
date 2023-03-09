require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/index");
const { handleNotFound, handleError } = require("./middlewares/error-handler");

const app = express();

// connect mongo
require("./configs/mongo-connection");

app.use(bodyParser.json());
app.use(cors());

// route
app.use("/api", routes);

// handle error
app.use(handleNotFound);
app.use(handleError);

app.listen(process.env.PORT);
