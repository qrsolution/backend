require("dotenv").config();

const PDF = require("../models/PDF"); // Import the PDF model
const Folder = require("../models/FOLDER");
const jwt = require("jsonwebtoken");
const User = require("../models/USER");
const fs = require("fs");
const mongoose = require("mongoose");
const { Readable } = require("stream");

module.exports = {
  uploadData: async (req, res) => {
    const requiredFiles = ["selectedFile"];
    const missingFiles = requiredFiles.filter((field) => !req.files[field]);

    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing file(s): ${missingFiles.join(", ")}`,
      });
    }

    const { buffer, originalname } = req.files.selectedFile[0];

    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
      const userId = decodedToken.userId;

      const pdf = new PDF({
        mainPdf: {
          fileId: null,
          filename: originalname,
        },
        title: req.body.title,
        pdfDetails: {
          pdfModel: req.body.input,
          PAT: req.body.input1,
          installationDate: (req.body.input2 && req.body.input2) || "",
        },
        user: userId,
      });

      const user = await User.findById(decodedToken.userId);
      user.allPdfs.push(pdf._id);
      await user.save();

      if (req.body.site) {
        const folder = await Folder.findOne({
          adresse: req.body.site,
          user: decodedToken.userId,
          "content.subFolder.name": req.body.publicOrPrivate,
        });

        if (folder) {
          const subFolder = folder.content.find(
            (sub) => sub.subFolder.name === req.body.publicOrPrivate
          );

          if (subFolder) {
            subFolder.subFolder.pdfFiles.push(pdf._id);
          } else {
            const newSubFolder = {
              subFolder: {
                name: req.body.publicOrPrivate,
                pdfFiles: [pdf._id],
              },
            };

            folder.content.push(newSubFolder);
          }

          await folder.save();
          pdf.dossier = folder._id;
          await pdf.save();
        } else {
          const newFolder = new Folder({
            adresse: req.body.site,
            user: decodedToken.userId,
            content: [
              {
                subFolder: {
                  name: req.body.publicOrPrivate,
                  pdfFiles: [pdf._id],
                },
              },
            ],
          });

          await newFolder.save();
          pdf.dossier = newFolder._id;
          await pdf.save();
        }
      }

      await pdf.save();

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "pdfFiles",
      });

      const uploadStream = gfs.openUploadStream(originalname, {
        metadata: { user: userId },
      });

      readableStream.pipe(uploadStream);

      uploadStream.once("finish", async () => {
        pdf.mainPdf.fileId = uploadStream.id;
        await pdf.save();

        res.status(200).json({ message: "Form uploaded successfully!" });
      });

      uploadStream.once("error", (error) => {
        console.error(error);
        res.status(500).send("Error occurred while uploading the form.");
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred while uploading the form.");
    }
  },
  uploadImage: async (req, res) => {
    const requiredFiles = ["selectedImage"];
    const missingFiles = requiredFiles.filter((field) => !req.files[field]);
    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing file(s): ${missingFiles.join(", ")}`,
      });
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
      const userId = decodedToken.userId;

      const pdf = await PDF.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      const { buffer, originalname } = req.files.selectedImage[0];

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "imageFiles",
      });

      const uploadStream = gfs.openUploadStream(originalname, {
        metadata: { user: userId },
      });

      readableStream.pipe(uploadStream);

      const lastPdf = await PDF.findOne({ user: userId })
        .sort({ _id: -1 })
        .limit(1);

      if (!lastPdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      uploadStream.once("finish", async () => {
        await PDF.findOneAndUpdate(
          { _id: lastPdf._id, user: userId }, // Find by both last PDF ID and userId
          {
            $set: {
              pdfImage: {
                fileId: uploadStream.id,
                filename: originalname,
              },
            },
          }
        );

        res.status(200).json({ message: "Image uploaded successfully!" });
      });

      uploadStream.once("error", (error) => {
        console.error(error);
        res.status(500).send("Error occurred while uploading the image.");
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred while uploading the image.");
    }
  },
  uploadFileInfo: async (req, res) => {
    const requiredFiles = ["selectedInfo"];
    const missingFiles = requiredFiles.filter((field) => !req.files[field]);
    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing file(s): ${missingFiles.join(", ")}`,
      });
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
      const userId = decodedToken.userId;

      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "fileInfoFiles",
      });

      const { buffer, originalname } = req.files.selectedInfo[0];

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = gfs.openUploadStream(originalname, {
        metadata: { user: userId },
      });

      readableStream.pipe(uploadStream);

      uploadStream.once("finish", async () => {
        const lastPdf = await PDF.findOne({ user: userId })
          .sort({ _id: -1 })
          .limit(1);

        if (!lastPdf) {
          return res.status(404).json({ error: "PDF not found" });
        }

        await PDF.findOneAndUpdate(
          { _id: lastPdf._id, user: userId },
          {
            $set: {
              fiche: {
                fileId: uploadStream.id,
                filename: originalname,
              },
            },
          }
        );

        res.status(200).json({ message: "PDF uploaded successfully!" });
      });

      uploadStream.once("error", (error) => {
        console.error(error);
        res.status(500).send("Error occurred while uploading the PDF.");
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred while uploading the PDF.");
    }
  },

  uploadDOE: async (req, res) => {
    const requiredFiles = ["selectedDOE"];
    const missingFiles = requiredFiles.filter((field) => !req.files[field]);
    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing file(s): ${missingFiles.join(", ")}`,
      });
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
      const userId = decodedToken.userId;

      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "doeFiles",
      });

      const doeFilesPromises = req.files.selectedDOE.map(async (file) => {
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        const uploadStream = gfs.openUploadStream(file.originalname, {
          metadata: { user: userId },
        });

        readableStream.pipe(uploadStream);

        return new Promise((resolve, reject) => {
          uploadStream.once("finish", () => {
            resolve({
              fileId: uploadStream.id,
              filename: file.originalname,
            });
          });

          uploadStream.once("error", (error) => {
            reject(error);
          });
        });
      });

      const doeFiles = await Promise.all(doeFilesPromises);

      const lastPdf = await PDF.findOne({ user: userId })
        .sort({ _id: -1 })
        .limit(1);

      if (!lastPdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      await PDF.findOneAndUpdate(
        { _id: lastPdf._id, user: userId },
        {
          $set: {
            doeFiles: doeFiles,
          },
        }
      );

      res.status(200).json({ message: "DOE files uploaded successfully!" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred while uploading the DOE files.");
    }
  },
};
