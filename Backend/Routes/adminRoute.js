const express = require("express");
const router = express.Router();
const path = require("path");
const adminController = require("../controller/adminController");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
});
router.post("/api/admin/login", adminController.login);
router.post("/logout", adminController.logout);

router.get("/api/admin/dashboard", adminController.verifyAdmin, async (req, res) => {
  try {
    const donasiBulanan = await prisma.campaign.groupBy({
      by: ["createdAt"],
      _sum: {
        collected_amount: true,
      },
    });

    const formattedDonasiBulanan = {};

    donasiBulanan.forEach((d) => {
      const date = new Date(d.createdAt);
      const bulan = date.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });

      if (!formattedDonasiBulanan[bulan]) {
        formattedDonasiBulanan[bulan] = 0;
      }
      formattedDonasiBulanan[bulan] += Number(d._sum.collected_amount);
    });

    const donasiBulananArray = Object.entries(formattedDonasiBulanan).map(
      ([bulan, total]) => ({
        bulan,
        total,
      })
    );

    const totalCampaign = await prisma.campaign.count();
    const totalDana = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: "berhasil" },
    });
    const totalUser = await prisma.accounts.count({
      where: { role: "user" },
    });

    res.json({
      total_campaign: totalCampaign,
      total_donasi: totalDana._sum.amount || 0,
      total_donatur: totalUser,
      donasiBulanan: donasiBulananArray,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
