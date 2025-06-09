const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCampaign(data) {
  const campaign = await prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      target_amount: data.target_amount,
    },
  });
  return campaign;
}


async function getAllCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      donations: {
        where: { status: "berhasil" },
        select: { amount: true },
      },
    },
  });

  return campaigns.map(c => {
    const totalDonasi = c.donations.reduce((sum, d) => sum + d.amount, 0);

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      goalAmount: c.target_amount,
      currentAmount: totalDonasi,
    };
  });
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

async function searchCampaigns(q) {
  return await prisma.campaign.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
  });
}



async function getUserCampaigns(userId) {
  try {
  const campaigns = await prisma.userCampaign.findMany({
    where: {
      userId: userId,
    },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          target_amount: true,
        },
      },
    },
  });

  // Mengembalikan data campaign jika ditemukan
  return campaigns.map((userCampaign) => userCampaign.campaign);
} catch (error) {
  console.error('Error fetching campaigns:', error);
  throw new Error('Gagal mengambil data campaign');
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
