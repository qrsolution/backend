const router = require("express").Router();
const controllers = require("../controllers");
const imageUpload = require("../middleware/imageUpload");
const multiUpload = require("../middleware/multiUpload");

/**
 * @route GET POST PUT DELETE /private-route
 * @group Private Routes
 * @returns {object} 200 - The public content
 * @returns {Error}  500 - An error occurred
 */

router.post(
  "/FormUpload/mainpdf",
  multiUpload.fields([{ name: "selectedFile", maxCount: 1 }]),
  controllers.formData.uploadData
);
router.post(
  "/FormUpload/image",
  multiUpload.fields([{ name: "selectedImage", maxCount: 1 }]),
  controllers.formData.uploadImage
);
router.post(
  "/FormUpload/fiche",
  multiUpload.fields([{ name: "selectedInfo", maxCount: 1 }]),
  controllers.formData.uploadFileInfo
);
router.post(
  "/FormUpload/doe",
  multiUpload.fields([{ name: "selectedDOE", maxCount: 20 }]),
  controllers.formData.uploadDOE
);

router.post(
  "/inscription",
  imageUpload.single("file"),
  controllers.userRegister.register
);

router.post("/seconnecter", controllers.userLogin.login);
router.post("/sites/creation", controllers.createSites.addSite);
router.post(
  "/public/verification/view/:code",
  controllers.verifyViewCode.verifyCode
);
router.post("/pdfs/:pdfID/raport", controllers.createPdfRaport.addRaport);
router.post("/forgot-password", controllers.forgotUserPassword.forgotPassword);
router.post("/reset-password", controllers.forgotUserPassword.resetPassword);
router.post("/verify-email", controllers.verification.verifyUser);

router.get("/:site/:folder/pdfs", controllers.allPdfs.allPdfs);
router.get(
  "/site/folder/pdf/details/:id",
  controllers.getPdfById.getPdfDataById
);
router.get("/site/folder/pdf/details/plan/:id", controllers.getPdfById.plan);
router.get("/site/folder/pdf/details/doe/:id", controllers.getPdfById.doeData);
router.get(
  "/site/folder/pdf/details/doefiles/:id",
  controllers.getPdfById.doeFiles
);
router.get("/site/folder/pdf/details/fiche/:id", controllers.getPdfById.fiche);
router.get(
  "/site/folder/pdf/details/raports/:id",
  controllers.getPdfById.raports
);
router.get(
  "/site/folder/pdf/details/image/:id",
  controllers.getPdfById.pdfImage
);

router.get("/sites", controllers.allSites.sites);
router.get("/pdf/raports", controllers.getRaports.getPdfReportsById);
router.get("/profile/user", controllers.getUserDataById.getData);
router.get("/notification", controllers.Notification.getNotification);

router.delete("/:site/:folder/pdfs/:title", controllers.deletePdf.delete);
router.delete("/site/:folderId", controllers.deleteSite.delete);

router.put("/site/:folderId", controllers.updateSite.updateFolder);
router.put(
  "/profile/user/:userId/username",
  controllers.updateUserData.userName
);
router.put(
  "/profile/user/:userId/code",
  controllers.updateUserData.verificationCode
);

/**
 * @route GET POST PUT DELETE /public-route
 * @group Public Routes
 * @returns {object} 200 - The public content
 * @returns {Error}  500 - An error occurred
 */

router.post("/contactus/message/:email", controllers.contactUs.sendMail);

router.get(
  "/public/site/folder/pdf/details/:id",
  controllers.public.getPdfDataById
);
router.get("/public/site/folder/pdf/details/plan/:id", controllers.public.plan);
router.get(
  "/public/site/folder/pdf/details/doe/:id",
  controllers.public.doeData
);
router.get(
  "/public/site/folder/pdf/details/doefiles/:id",
  controllers.public.doeFiles
);
router.get(
  "/public/site/folder/pdf/details/fiche/:id",
  controllers.public.fiche
);
router.get(
  "/public/site/folder/pdf/details/raports/:id",
  controllers.public.raports
);
router.get(
  "/public/site/folder/pdf/details/image/:id",
  controllers.public.pdfImage
);
router.get("/public/pdf/raports", controllers.getRaports.getPdfReportsById);

module.exports = router;
