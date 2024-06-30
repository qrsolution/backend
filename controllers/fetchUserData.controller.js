require("dotenv").config();

const jwt = require("jsonwebtoken");
const UserAccount = require("../models/USER");

module.exports = {
  async getData(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { userId } = decoded;
      const user = await UserAccount.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch the logged-in user's data
      const userData = await UserAccount.findOne({ _id: userId });

      if (!userData) {
        return res.status(404).json({ error: "User data not found" });
      }

      let userDataWithImage;

      if (userData.profileImage) {
        const base64ImageData = userData.profileImage.toString("base64");

        userDataWithImage = {
          ...userData.toObject(),
          profileImage: base64ImageData,
        };
      } else {
        userDataWithImage = {
          ...userData.toObject(),
        };
      }

      return res.status(200).json({ userData: userDataWithImage });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  },
};
