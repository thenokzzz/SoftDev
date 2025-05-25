const express = require("express");
const router = express.Router();
const multer = require("multer");
const campaignController = require("../controller/campaignController");

// konfigurasi storage multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // folder tempat gambar disimpan
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes
router.post(
  "/campaign",
  upload.single("image"),
  campaignController.createCampaign
);

router.put(
  "/campaign/:id",
  upload.single("image"),
  campaignController.updateCampaign
);

router.get("/campaign", campaignController.getAllCampaigns);
router.get("/campaign/:id", campaignController.getCampaignById);
router.delete("/campaign/:id", campaignController.deleteCampaign);

module.exports = router;
