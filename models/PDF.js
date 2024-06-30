const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  mainPdf: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,
  },
  title: String,
  creationDate: { type: Date, default: Date.now },
  dossier: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "UserAccount" },
  raports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Raport" }],
  pdfDetails: {
    pdfModel: String,
    PAT: String,
    installationDate: Date,
  },
  pdfImage: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,
  },
  fiche: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,
  },
  doeFiles: [
    {
      filename: String,
      fileId: mongoose.Schema.Types.ObjectId,
    },
  ],
});

module.exports = mongoose.model("PDFs", pdfSchema);
