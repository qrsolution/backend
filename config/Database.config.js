require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://PDF01:lm3SxPP9ahk4owsH@cluster0.dtutsqg.mongodb.net/work",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("----Data Base Connection------------------------");
    console.log("MONGO Connection SUCCESS !!!!");
  } catch (err) {
    console.error("MONGO Connection FAIL !!!!", err);
    process.exit(1);
  }
};

module.exports = connectDB;
