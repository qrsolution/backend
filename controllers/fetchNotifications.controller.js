require("dotenv").config();

const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const USER = require("../models/USER");

module.exports = {
  getNotification: async (req, res) => {
    try {
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

      const { userId } = decoded;
      const user = await USER.findById(userId);

      let notificationList = [];

      const notifications = await Notification.find({
        equipementId: { $in: user.allPdfs },
      });

      if (notifications.length === 0) {
        return res.status(404).json({ message: "No notifications found" });
      }

      notificationList = notifications;

      res.status(200).json({ notifications: notificationList });
    } catch (err) {
      res.status(500).json({ message: err.message });
      console.log(err);
    }
  },
};
