const express = require("express");
const router = express.Router();
const multer = require("multer");
const galleryController = require("../controller/galeriController"); // controller galeri

// konfigurasi storage multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Frontend/public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes untuk galeri
router.post("/galeri", upload.single("image"), galleryController.createGallery);

router.put(
  "/galeri/:id",
  upload.single("image"),
  galleryController.updateGallery
);

router.get("/galeri", galleryController.getAllGalleries);
router.get("/galeri/:id", galleryController.getGalleryById);
router.delete("/galeri/:id", galleryController.deleteGallery);
router.get("/galeri/search", galleryController.searchGalleries);

module.exports = router;
