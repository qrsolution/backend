const PDFs = require("../models/PDF"); // Import your PDF model
const Folder = require("../models/FOLDER");
const UserAccount = require("../models/USER");
const jwt = require("jsonwebtoken");
const { deleteFileById } = require("../utils/deleteFile");

module.exports = {
  async delete(req, res) {
    try {
      const { site, folder, title } = req.params;

      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const folderObj = await Folder.findOne({
        adresse: site,
        "content.subFolder.name": folder,
      }).populate({
        path: "content.subFolder.pdfFiles",
        model: "PDFs",
      });

      if (!folderObj) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const subFolder = folderObj.content.find(
        (contentItem) => contentItem.subFolder.name === folder
      ).subFolder;

      const pdfFileIndex = subFolder.pdfFiles.findIndex(
        (pdfFile) => pdfFile.title === title
      );

      if (pdfFileIndex === -1) {
        return res.status(404).json({ message: "PDF file not found" });
      }

      const deletedPdf = subFolder.pdfFiles.splice(pdfFileIndex, 1)[0];

      await folderObj.save();

      await PDFs.deleteOne({ _id: deletedPdf._id });

      // Delete associated files from GridFS
      if (deletedPdf.mainPdf && deletedPdf.mainPdf.fileId) {
        deleteFileById(deletedPdf.mainPdf.fileId, "pdfFiles");
      }

      if (deletedPdf.pdfImage && deletedPdf.pdfImage.fileId) {
        deleteFileById(deletedPdf.pdfImage.fileId, "imageFiles");
      }

      if (deletedPdf.fiche && deletedPdf.fiche.fileId) {
        deleteFileById(deletedPdf.fiche.fileId, "fileInfoFiles");
      }

      for (const doeFile of deletedPdf.doeFiles) {
        if (doeFile && doeFile.fileId) {
          deleteFileById(doeFile.fileId, "doeFiles");
        }
      }

      // Delete the PDF reference from the UserAccount schema
      const user = await UserAccount.findOne({ userId: decoded.userId });
      if (user) {
        const pdfIndex = user.allPdfs.findIndex(
          (pdfId) => pdfId.toString() === deletedPdf._id.toString()
        );
        if (pdfIndex !== -1) {
          user.allPdfs.splice(pdfIndex, 1);
          await user.save();
        }
      }

      res.json({
        message: "PDF file and associated files deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.error(error);
    }
  },
};
