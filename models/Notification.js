const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  site: {
    type: String,
    required: true,
  },
  dossier: {
    type: String,
    required: true,
  },
  société: {
    type: String,
    required: true,
  },
  equipementId: { type: mongoose.Schema.Types.ObjectId, ref: "PDFs" },
  equipementName: {
    type: String,
    required: true,
  },
  notificationDate: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
