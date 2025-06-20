const campaignModel = require("../model/campaignModel");
const { auth } = require("../controller/authController");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fungsi untuk mengambil campaign yang dipilih oleh user
async function getUserCampaigns(req, res) {
  try {
    const campaignsDonated = await prisma.donation.findMany({
      where: { userId: req.user.id },
      distinct: ["campaignId"],
      include: {
        campaign: true,
      },
    });
    const campaigns = campaignsDonated.map((d) => d.campaign);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan", detail: error.message });
  }
}

async function createCampaign(req, res) {
  try {
    const { title, description, target_amount_raw } = req.body;
    const userId = req.user.id;

    if (!title || !target_amount_raw) {
      return res.status(400).json({ error: "title and target_amount required" });
    }

    const imageFile = req.file;
    const imageFilename = imageFile ? imageFile.filename : null;

    const targetAmount = Number(target_amount_raw);
    if (isNaN(targetAmount)) {
      return res.status(400).json({ error: "Valid target_amount required" });
    }

    const campaign = await campaignModel.createCampaign({
      title,
      description,
      target_amount: targetAmount,
      image: imageFilename,
      userId,
    });
    res.status(201).json({
      message: "Campaign berhasil ditambahkan",
      campaign,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}

async function getAllCampaigns(req, res) {
  try {
    const campaigns = await campaignModel.getAllCampaigns();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCampaignById(req, res) {
  try {
    const { id } = req.params;
    const campaign = await campaignModel.getCampaignById(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const { title, description, target_amount } = req.body;

    const targetAmount = Number(target_amount);
    if (!title || isNaN(targetAmount)) {
      return res
        .status(400)
        .json({ error: "Title and valid target_amount required" });
    }
    const updatedData = {
      title,
      description,
      target_amount: targetAmount,
    };

    const updatedCampaign = await campaignModel.updateCampaign(id, updatedData);

    if (!updatedCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(updatedCampaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteCampaign(req, res) {
  try {
    const { id } = req.params;
    await campaignModel.deleteCampaign(id);
    res.json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function searchCampaigns(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "q is required for search" });
    }

    const results = await campaignModel.searchCampaigns(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  searchCampaigns,
  getUserCampaigns,
};
