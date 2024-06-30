require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../models/USER");

module.exports = {
  verifyUser: async (req, res) => {
    try {
      const token = req.body.tokenFromUrl;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await User.findOneAndUpdate(
        { email: decodedToken.email },
        { $set: { emailVerified: true, verificationToken: null } },
        { new: true }
      );

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }

      res.status(201).json({ message: "Email verification successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
