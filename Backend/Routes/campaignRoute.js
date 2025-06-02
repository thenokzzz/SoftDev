const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth } = require("../controller/authController");
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

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
}

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

router.get("/user/campaign", auth, campaignController.getUserCampaigns);
router.get("/search", campaignController.searchCampaigns);
router.get("/campaign", campaignController.getAllCampaigns);
router.get("/campaign/:id", campaignController.getCampaignById);
router.delete("/campaign/:id", campaignController.deleteCampaign);
router.get("/donation", requireLogin, (req, res) => {
res.sendFile(path.join(__dirname, "../Frontend/HTML/donation.html"));
});



module.exports = router;
