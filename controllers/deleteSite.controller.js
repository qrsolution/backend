require("dotenv").config();
const jwt = require("jsonwebtoken");
const UserAccount = require("../models/USER");
const mongoose = require("mongoose");
const Folder = require("../models/FOLDER");
const {
  Types: { ObjectId },
} = mongoose;
const PDFs = require("../models/PDF");
const { deleteFileById } = require("../utils/deleteFile");

module.exports = {
  async delete(req, res) {
    try {
      const { folderId } = req.params;
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

      const { userId, pdfList } = decodedToken;
      const user = await UserAccount.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      const folder = await Folder.findOneAndDelete({
        _id: folderId,
        user: user._id,
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const pdfsToDelete = await PDFs.find({ dossier: folderId });

      // Delete related PDFs
      for (const pdf of pdfsToDelete) {
        await PDFs.deleteOne({ _id: pdf._id });
        deleteFileById(pdf.mainPdf.fileId, "pdfFiles");
        deleteFileById(pdf.pdfImage.fileId, "imageFiles");
        deleteFileById(pdf.fiche.fileId, "fileInfoFiles");
        for (const doeFile of pdf.doeFiles) {
          deleteFileById(doeFile.fileId, "doeFiles");
        }
      }

      // Remove deleted PDFs from the user's allPdfs field
      user.allPdfs = user.allPdfs.filter(
        (pdfId) => !pdfsToDelete.some((pdf) => pdf._id.equals(pdfId))
      );

      user.folders.pull(folder._id);
      await user.save();

      return res.json({
        message: "Folder and related PDFs deleted successfully",
      });
    } catch (error) {
      console.error(error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
