require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://service:jawher123@cluster0.fuplva1.mongodb.net/qrsolution",
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
