const mongoose = require("mongoose");

const { connection } = mongoose;

// Utility function to delete a file by its _id
async function deleteFileById(fileId, gfsBucketName) {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: gfsBucketName,
    });

    if (fileId) {
      await gfs.delete(fileId);
      console.log(`File deleted successfully from : ${gfsBucketName}`);
    } else {
      console.log(`not exist : ${gfsBucketName}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

module.exports = { deleteFileById };
