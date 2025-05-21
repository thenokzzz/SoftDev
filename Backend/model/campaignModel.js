const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCampaign(data) {
  return await prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      target_amount: data.target_amount  // harus angka, contoh: 1000000
    }
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
  return await prisma.campaign.update({
    where: { id: Number(id) },
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      target_amount: data.target_amount
    },
  });
}

async function deleteCampaign(id) {
  return await prisma.campaign.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
