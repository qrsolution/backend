const Raport = require("../models/Raport");
const PDF = require("../models/PDF");
const UserAccount = require("../models/USER");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

module.exports = {
  async addRaport(req, res) {
    try {
      const { pdfID } = req.params;
      const {
        société,
        observation,
        piècesChangées,
        dateProchainEntretien,
        option,
        code,
        site,
        dossier,
      } = req.body;

      const token = req?.headers?.authorization?.split(" ")[1] || null;

      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

        const pdf = await PDF.findById(pdfID);
        if (!pdf) {
          return res.status(404).json({ error: "PDF not found." });
        }

        const user = await UserAccount.findOne({
          _id: decoded.userId,
          verification_code: code,
        });

        if (!user) {
          return res
            .status(403)
            .json({ error: "le code du maintenance est invalide" });
        }

        let options = [];

        options.push(option);

        const newRaport = new Raport({
          société,
          observation,
          piècesChangées,
          dateProchainEntretien,
          dateDernierEntretien: new Date(),
          pdf: req.body.id,
          user: decoded.userName,
          options,
        });

        const savedRaport = await newRaport.save();

        const newNotification = new Notification({
          société,
          equipementId: pdf._id,
          equipementName: pdf.title,
          notificationDate: Date.now(),
          message: "Nouveau rapport ajouté",
          site,
          dossier,
        });

        await newNotification.save();

        pdf.raports.push(savedRaport._id);
        await pdf.save();

        res.status(200).json(savedRaport);
      } else {
        const pdf = await PDF.findById(pdfID);
        if (!pdf) {
          return res.status(404).json({ error: "PDF not found." });
        }

        const user = await UserAccount.findOne({
          verification_code: code,
        });

        if (!user) {
          return res
            .status(403)
            .json({ error: "le code du maintenance est invalide" });
        }

        let options = [];

        options.push(option);

        const newRaport = new Raport({
          société,
          observation,
          piècesChangées,
          dateProchainEntretien,
          dateDernierEntretien: new Date(),
          pdf: req.body.id,
          options,
        });

        const savedRaport = await newRaport.save();

        const newNotification = new Notification({
          site,
          dossier,
          société,
          equipementId: pdf._id,
          equipementName: pdf.title,
          notificationDate: Date.now(),
          message: "Nouveau rapport ajouté",
          site,
          dossier,
        });

        await newNotification.save();

        pdf.raports.push(savedRaport._id);
        await pdf.save();
        res.status(200).json(savedRaport);
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the PDF report." });
    }
  },
};
