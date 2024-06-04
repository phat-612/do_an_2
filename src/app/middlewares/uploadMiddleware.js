// uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../../public/img/uploads"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => {
      const parts = file.originalname.split(".");
      return parts[parts.length - 1];
    },
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});
const upload = multer({ storage: storage });
const removeImgCloudinary = (fileName) => {
  public_id = `uploads/${fileName.split(".")[0]}`;
  cloudinary.uploader.destroy(public_id, (err, result) => {});
};
module.exports = { upload, removeImgCloudinary };
