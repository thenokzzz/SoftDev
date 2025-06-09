const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { auth } = require("../controller/authController");

// Inisialisasi Snap Midtrans
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-cVagPDP8gc4My0M62bBlqlnh",
});

router.post("/donation", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { campaignId, grossAmount, firstName, lastName, email, phone } =
      req.body;

    // Validasi nominal donasi
    if (!grossAmount || isNaN(grossAmount) || grossAmount < 10000) {
      return res.status(400).json({ error: "Nominal donasi tidak valid" });
    }

    // Ambil campaign beserta total donasi yang sudah masuk
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(campaignId) },
      include: {
        donations: {
          where: {
            status: "berhasil",
          },
          select: { amount: true },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign tidak ditemukan" });
    }

    const totalDonasiSekarang = campaign.donations.reduce(
      (sum, d) => sum + d.amount,
      0
    );
    const targetCampaign = campaign.target_amount;
    const sisa = targetCampaign - totalDonasiSekarang;
    console.log({
      targetCampaign,
      totalDonasiSekarang,
      sisa,
      grossAmount,
    });

    // Cek apakah donasi akan melebihi target
    if (grossAmount > sisa) {
      return res.status(400).json({
        error: `Donasi melebihi target. Maksimal yang bisa didonasikan: Rp${sisa.toLocaleString(
          "id-ID"
        )}`,
      });
    }
    const orderId = `DONATION-${userId}-${campaignId}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      },
      callbacks: {
        finish: "/home",
      },
    };
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    await prisma.donation.create({
      data: {
        amount: grossAmount,
        status: "berhasil",
        orderId: orderId,
        user: {
          connect: { id: userId },
        },
        campaign: {
          connect: { id: campaignId },
        },
      },
    });

    res.json({ transactionToken: snapToken });
  } catch (error) {
    console.log("req.body:", req.body);
    console.error("Gagal membuat Snap Token:", error);
    res.status(500).json({ error: "Gagal memproses donasi" });
  }
});

router.get("/admin/donations", async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ donations });
  } catch (error) {
    console.error("Gagal ambil data donasi:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user/donations", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const donations = await prisma.donation.findMany({
      where: { userId: userId },
      include: {
        campaign: { select: { id: true, title: true } }, 
      },
      orderBy: { createdAt: "desc" }, 
    });
    res.json({ donations });
  } catch (error) {
    console.error("Gagal mengambil riwayat donasi:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil riwayat donasi" });
  }
});

router.get("/admin/donations/stats", async (req, res) => {
  try {
    const stats = await prisma.donation.groupBy({
      by: ['campaignId'],
      _sum: { amount: true },
      where: { status: 'berhasil' },
    });
    const campaignIds = stats.map(s => s.campaignId);
    const campaigns = await prisma.campaign.findMany({
      where: { id: { in: campaignIds } },
      select: { id: true, title: true }
    });
    const result = stats.map(s => {
      const campaign = campaigns.find(c => c.id === s.campaignId);
      return {
        campaignTitle: campaign ? campaign.title : "Unknown",
        totalDonation: s._sum.amount
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil statistik donasi" });
  }
});

router.get("/admin/donations-per-month", async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        status: "berhasil"
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    const monthlyStats = Array(12).fill(0); // index 0 = Jan, 11 = Des

    donations.forEach((donation) => {
      const month = donation.createdAt.getMonth(); // 0-based
      monthlyStats[month] += donation.amount;
    });

    res.json({ monthlyStats });
  } catch (error) {
    console.error("Gagal ambil donasi per bulan:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
