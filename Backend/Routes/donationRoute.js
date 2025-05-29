const express = require("express");
const router = express.Router();
const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Inisialisasi Snap Midtrans
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-cVagPDP8gc4My0M62bBlqlnh",
});

router.post("/donation", async (req, res) => {
  try {
    const {
      userId,
      campaignId,
      grossAmount,
      firstName,
      lastName,
      email,
      phone,
    } = req.body;

    // Validasi nominal donasi
    if (!grossAmount || isNaN(grossAmount) || grossAmount < 10000) {
      return res.status(400).json({ error: "Nominal donasi tidak valid" });
    }

    // Ambil campaign beserta total donasi yang sudah masuk
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(campaignId) },
      include: {
        donations: {
          where: { status: "berhasil" },
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
        status: "berhasil", // ← status awal sebelum sukses bayar
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

module.exports = router;
