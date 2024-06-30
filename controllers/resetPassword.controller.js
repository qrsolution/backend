const User = require("../models/USER");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const sendResetEmail = async (email, resetLink, expirationTime, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "qrsolution548",
      pass: "pupihdlbdzdbkotr",
    },
  });

  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "../public/resetPassword.html"),
    "utf-8"
  );

  let text, buttonText;
  if (type === "change") {
    text = "changez votre mot de passe";
    buttonText = "changer";
  } else if (type === "reset") {
    text = "Réinitialisez votre mot de passe";
    buttonText = "Réinitialisez";
  }

  const emailContentWithExpiration = htmlTemplate
    .replace("{resetLink}", resetLink)
    .replace("{expiration}", expirationTime)
    .replace("{type}", text)
    .replace("{buttonText}", buttonText);

  const mailOptions = {
    from: "no-reply@qrsolution.com",
    to: email,
    subject: text,
    html: emailContentWithExpiration,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  async forgotPassword(req, res) {
    const { email, emailType } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const expirationTime = Date.now() + 600000;

      const resetLink = `https://qr-solution-beta.netlify.app/reset-password?email=${encodeURIComponent(
        email
      )}&expiration=${expirationTime}`;

      await sendResetEmail(email, resetLink, expirationTime, emailType);

      res.status(200).json({ message: "Reset email sent successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async resetPassword(req, res) {
    const { email, password, expiration } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentTime = Date.now();
      if (expiration < currentTime) {
        return res.status(400).json({ message: "Reset link has expired" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
