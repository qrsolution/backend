const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PDF = require("../models/PDF");
const path = require("path");

module.exports = {
  async getPdfDataById(req, res) {
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      let filteredPdfData = {};
      const { raports, pdfDetails, pdfImage, _id, title } = pdf;

      filteredPdfData = {
        raports,
        pdfDetails,
        title,
        _id,
      };

      res.status(200).json({ pdf: filteredPdfData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async pdfImage(req, res) {
    try {
      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "imageFiles",
      });
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      const { pdfImage } = pdf;

      if (!pdfImage || !pdfImage.fileId) {
        return res.status(404).json({ error: "infoPDF file not found." });
      }

      const downloadStream = gfs.openDownloadStream(pdfImage.fileId);

      const fileExtension = path.extname(pdfImage.filename).toLowerCase();

      let imageContentType;
      switch (fileExtension) {
        case ".jpg":
        case ".jpeg":
          imageContentType = "image/jpeg";
          break;
        case ".png":
          imageContentType = "image/png";
          break;
        default:
          imageContentType = "image/jpeg";
      }

      res.setHeader("Content-Type", imageContentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename=${pdfImage.filename}`
      );

      downloadStream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async plan(req, res) {
    try {
      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "pdfFiles",
      });
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      const { mainPdf } = pdf;

      if (!mainPdf || !mainPdf.fileId) {
        return res.status(404).json({ error: "Main PDF not found." });
      }

      const downloadStream = gfs.openDownloadStream(mainPdf.fileId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${mainPdf.filename}`
      );

      downloadStream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async doeData(req, res) {
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      let filteredPdfData = {};
      const { doeFiles, _id } = pdf;

      filteredPdfData = {
        _id,
        doeFiles,
      };

      res.status(200).json({ pdf: filteredPdfData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async fiche(req, res) {
    try {
      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "fileInfoFiles",
      });
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      const { fiche } = pdf;

      if (!fiche || !fiche.fileId) {
        return res.status(404).json({ error: "infoPDF file not found." });
      }

      const downloadStream = gfs.openDownloadStream(fiche.fileId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fiche.filename}`
      );

      downloadStream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async raports(req, res) {
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

      const pdf = await PDF.findById(req.params.id);

      if (!pdf) {
        return res.status(404).json({ error: "PDF not found." });
      }

      let filteredPdfData = {};
      const { raports, _id } = pdf;

      filteredPdfData = {
        _id,
        raports,
      };

      res.status(200).json({ pdf: filteredPdfData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
  async doeFiles(req, res) {
    try {
      const { connection } = mongoose;
      const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "doeFiles",
      });

      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Authorization token is missing" });
      }

      const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const fileId = req.params.id;

      const query = { _id: new mongoose.Types.ObjectId(fileId) };
      const doeFile = await gfs.find(query).toArray();

      if (!doeFile || doeFile.length === 0) {
        return res.status(404).json({ message: "DOE file not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${doeFile[0].filename}`
      );
      const downloadStream = gfs.openDownloadStream(doeFile[0]._id);
      downloadStream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve PDF data." });
    }
  },
};
