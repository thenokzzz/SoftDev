const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCampaign(data) {
  return await prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      target_amount: data.target_amount, // pastikan sudah Number sebelum dikirim
    },
  });
}

async function getAllCampaigns() {
  return await prisma.campaign.findMany();
}

async function getCampaignById(id) {
  return await prisma.campaign.findUnique({
    where: { id: Number(id) },
  });
}

async function updateCampaign(id, data) {
  const campaignId = Number(id);
  const existing = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!existing) return null;

  return await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      target_amount: data.target_amount,
    },
  });
}

async function deleteCampaign(id) {
  const campaignId = Number(id);
  const existing = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!existing) return null;

  return await prisma.campaign.delete({
    where: { id: campaignId },
  });
}

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
