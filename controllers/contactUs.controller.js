const { sendContactUsEmail } = require("../middleware/sendEmail");

require("dotenv").config();

module.exports = {
  sendMail: async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const userEmail = email;
      console.log(userEmail);

      if (!name) {
        return res.status(401).json({ message: "name must be provided" });
      }
      if (!message) {
        return res.status(401).json({ message: "message must be provided" });
      }

      if (!userEmail) {
        return res.status(401).json({ message: "userEmail must be provided" });
      }

      const adminEmail = "qrsolution548@gmail.com"; // Replace with your admin's email address

      // Send email to admin
      const adminEmailSent = await sendContactUsEmail(
        adminEmail,
        userEmail,
        name,
        message
      );
      const userEmailSent = await sendContactUsEmail(userEmail, name, message);

      // Send email to user

      if (adminEmailSent && userEmailSent) {
        res.status(200).json({ message: "Both emails sent successfully" });
      } else {
        res.status(500).json({ message: "Emails failed to send" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
