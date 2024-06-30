const Folder = require("../models/FOLDER");
const jwt = require("jsonwebtoken");
const UserAccount = require("../models/USER");

module.exports = {
  async updateFolder(req, res) {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const tokenWithoutBearer = token.split(" ")[1];

      const { userId } = jwt.verify(
        tokenWithoutBearer,
        process.env.SECRET_TOKEN
      );

      const user = await UserAccount.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      const { folderId } = req.params;
      const { adresse, code_postal, subfolders, name } = req.body;

      if (!adresse || !code_postal) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const folder = await Folder.findById(folderId);

      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }

      if (folder.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingFolder = await Folder.findOne({
        name,
        user: userId,
      });

      if (existingFolder) {
        return res.status(401).json({ message: "Le dossier existe déjà" });
      }

      folder.name = name;
      folder.adresse = adresse;
      folder.code_postal = code_postal;

      if (subfolders && Array.isArray(subfolders)) {
        const existingSubfolderNames = folder.content.map(
          (subFolder) => subFolder.subFolder.name
        );

        const newSubfolderNames = subfolders.filter(
          (name) => !existingSubfolderNames.includes(name)
        );

        const newSubfolders = newSubfolderNames.map((name) => ({
          subFolder: {
            name,
            type: "folder",
            ref: [],
            total: 0,
            pdfFiles: [],
          },
        }));

        folder.content = [...folder.content, ...newSubfolders];
      }

      await folder.save();

      res.json({ message: "Folder updated successfully", folder });
    } catch (error) {
      console.error(error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      res
        .status(500)
        .json({ error: "An error occurred while updating the folder" });
    }
  },
};
