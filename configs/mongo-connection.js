const mongoose = require("mongoose");

const mongoConnection = mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    console.log("mongoConnected");
  })
  .catch((err) => console.log(err));

module.exports = mongoConnection