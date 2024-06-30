const mongoose = require("mongoose");

const pdfReportSchema = new mongoose.Schema({
  société: String,
  observation: String,
  piècesChangées: String,
  dateProchainEntretien: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > this.dateDernierEntretien;
      },
      message:
        "La date du prochain entretien doit être postérieure à la date du dernier entretien.",
    },
  },
  dateDernierEntretien: { type: Date, default: Date.now },
  pdf: { type: mongoose.Schema.Types.ObjectId, ref: "PDFs" },
  user: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    validate: {
      validator: function (value) {
        return value !== null || value !== "";
      },
      message: "Invalid user field",
    },
  },
  options: [String],
});

pdfReportSchema.pre("save", function (next) {
  if (!this.user || this.user === null || this.user === "") {
    this.user = "technicien";
  }
  next();
});

module.exports = mongoose.model("Raport", pdfReportSchema);
