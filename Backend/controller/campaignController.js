const campaignModel = require("../model/campaignModel");

async function createCampaign(req, res) {
  try {
    const { title, description, target_amount } = req.body;
    if (!title || !target_amount)
      return res
        .status(400)
        .json({ error: "title and target_amount required" });

    // cek file gambar dari multer
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ error: "Image is required" });
    }

    const targetAmount = Number(req.body.target_amount_raw);
    if (!title || isNaN(targetAmount)) {
      return res
        .status(400)
        .json({ error: "Title and valid target_amount required" });
    }

    const newCampaign = await campaignModel.createCampaign({
      title,
      description,
      target_amount: targetAmount,
      image: imageFile.filename,
    });

    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const imageFile = req.file;

    const updatedData = {
      title,
      description,
      target_amount: targetAmount,
    };

    if (imageFile) {
      updatedData.image = imageFile.filename;
    }

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

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
