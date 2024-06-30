const User = require("../models/USER");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  userName: async (req, res) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const tokenWithoutBearer = token.split(" ")[1];

      const decodedToken = jwt.verify(
        tokenWithoutBearer,
        process.env.SECRET_TOKEN
      );

      const { userId } = decodedToken;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      const { userName, userPassword } = req.body;

      if (!userName) {
        return res.status(401).json({ message: "user name most be not empty" });
      }
      if (!userPassword) {
        return res.status(401).json({ message: "password most be not empty" });
      }

      const hashedPassword = await bcrypt.compare(userPassword, user.password);

      if (!hashedPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      user.userName = userName;
      user.modified = Date.now();

      await user.save();

      res.status(201).json({ message: "User data updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the folders" });
    }
  },
  verificationCode: async (req, res) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const tokenWithoutBearer = token.split(" ")[1];

      const decodedToken = jwt.verify(
        tokenWithoutBearer,
        process.env.SECRET_TOKEN
      );

      const { userId } = decodedToken;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      const { verificationCode, userPassword } = req.body;

      if (!verificationCode) {
        return res
          .status(401)
          .json({ message: "verification code most be not empty" });
      }
      if (!userPassword) {
        return res.status(401).json({ message: "password most be not empty" });
      }

      const hashedPassword = await bcrypt.compare(userPassword, user.password);

      if (!hashedPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      user.verification_code = verificationCode;
      user.modified = Date.now();

      await user.save();

      res.status(201).json({ message: "User data updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the folders" });
    }
  },
};
