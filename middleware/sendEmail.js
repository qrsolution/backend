const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "qrsolution548",
        pass: "pupihdlbdzdbkotr",
      },
    });

    const verificationLink = `https://qr-solution-beta.netlify.app/verifier?token=${verificationToken}`;

    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../public/accountConfirmation.html"),
      "utf-8"
    );

    const content = htmlTemplate.replace("{resetLink}", verificationLink);

    const mailOptions = {
      from: "qrsolution548@gmail.com",
      to: email,
      subject: "Email Verification",
      html: content,
    };

    await transporter.sendMail(mailOptions);

    console.log("message:", "verification email sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendContactUsEmail = async (email, mailText, name, message) => {
  console.log(email);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "qrsolution548",
        pass: "pupihdlbdzdbkotr",
      },
    });

    const user = fs.readFileSync(
      path.join(__dirname, "../public/contactUsToUser.html"),
      "utf-8"
    );

    const admin = fs.readFileSync(
      path.join(__dirname, "../public/contactUsToAdmin.html"),
      "utf-8"
    );

    const content =
      email === "qrsolution548@gmail.com"
        ? admin
            .replace("{nom}", name)
            .replace("{nom}", name)
            .replace("{email}", mailText)
            .replace("{message}", message)
        : user;

    const mailOptions = {
      from: "qrsolution548@gmail.com",
      to: email,
      subject:
        email === "qrsolution548@gmail.com"
          ? ` Nouvelle soumission de formulaire de contact - ${name}`
          : "Merci de nous avoir contactés !",
      html: content,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendContactUsEmail,
  sendVerificationEmail,
};
