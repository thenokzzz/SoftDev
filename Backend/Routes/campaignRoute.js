const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
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

router.post(
  "/campaign",
  upload.single("image"),
  campaignController.createCampaign
);

router.put("/campaign/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, target_amount } = req.body;
  const image = req.file?.filename;

  try {
    const dataToUpdate = {
      title,
      description,
      target_amount: Number(target_amount), // wajib Number
    };
    if (image) {
      dataToUpdate.image = image;
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    res.json(updatedCampaign);
  } catch (error) {
    console.error("Gagal update campaign:", error);
    res.status(500).json({ error: "Gagal mengupdate campaign" });
  }
});

router.get("/campaign", campaignController.getAllCampaigns);
router.get("/campaign/:id", campaignController.getCampaignById);
router.put(
  "/campaign/:id",
  upload.single("image"),
  campaignController.updateCampaign
);
router.delete("/campaign/:id", campaignController.deleteCampaign);

module.exports = router;
