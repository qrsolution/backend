const Folder = require("../models/FOLDER");
const jwt = require("jsonwebtoken");
const UserAccount = require("../models/USER");

module.exports = {
  async sites(req, res) {
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
      const user = await UserAccount.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      const folders = await Folder.find({ user: userId });
      res.status(200).json(folders);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the folders" });
    }
  },
};
