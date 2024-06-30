const mongoose = require("mongoose");

const USERS = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  verification_code: {
    type: String,
  },
  allPdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: "PDFs" }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
  userCreationAccountDate: { type: Date, default: Date.now },
  modified: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
});

USERS.pre("save", function (next) {
  if (this.isNew) {
    if (!this.userId) {
      this.userId = this._id;
    }

    const username = this.userName.toLowerCase();
    const randomNum = Math.floor(Math.random() * 10000) + 1;

    this.verification_code = `maintenance_${username.slice(0, 3)}${randomNum}`;
  }

  next();
});

module.exports = mongoose.model("User", USERS);
