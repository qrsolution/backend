require("dotenv").config();

const jwt = require("jsonwebtoken");
const Folder = require("../models/FOLDER");
const PDF = require("../models/PDF");

module.exports = {
  async allPdfs(req, res) {
    try {
      const { site, folder } = req.params;

      const token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const targetFolder = await Folder.findOne({
        adresse: site,
        "content.subFolder.name": folder,
      });

      if (!targetFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const subFolder = targetFolder.content.find(
        (sub) => sub.subFolder.name === folder
      );

      if (!subFolder) {
        return res.status(404).json({ message: "Subfolder not found" });
      }

      const pdfs = await PDF.find(
        {
          _id: { $in: subFolder.subFolder.pdfFiles },
        },
        { mainPdf: { filename: 1 }, _id: 1, title: 1, creationDate: 1 }
      );

      res.status(200).json({ pdfs });
    } catch (err) {
      res.status(500).json({ message: err.message });
      console.log(err);
    }
  },
};
