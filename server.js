require("dotenv").config();

const express = require("express");
var cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const connectDB = require("./config/Database.config");
connectDB();

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.use(bodyParser.json());
app.use(helmet());
app.use(helmet.contentSecurityPolicy());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.xssFilter());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(require("./routes"));

app.listen(process.env.PORT || null, () => {
  console.log(`Server is running on port ${process.env.PORT || null}`);
});
