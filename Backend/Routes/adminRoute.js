const express = require("express");
const router = express.Router();
const path = require("path");
const adminController = require("../controller/adminController");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function ensureAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ message: "Unauthorized" });
}

router.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
});
router.post("/login", adminController.login);
router.post("/logout", adminController.logout);

router.get("/api/admin/dashboard", ensureAdmin, async (req, res) => {
  try {
    const donasiBulanan = await prisma.donation.groupBy({
      by: ["created_at"],
      _sum: {
        amount: true,
      },
    });

    const formattedDonasiBulanan = {};

    donasiBulanan.forEach((d) => {
      const date = new Date(d.created_at);
      const bulan = date.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });

      if (!formattedDonasiBulanan[bulan]) {
        formattedDonasiBulanan[bulan] = 0;
      }
      formattedDonasiBulanan[bulan] += Number(d._sum.amount);
    });

    const donasiBulananArray = Object.entries(formattedDonasiBulanan).map(
      ([bulan, total]) => ({
        bulan,
        total,
      })
    );

    const totalCampaign = await prisma.campaign.count();
    const totalDana = await prisma.campaign.aggregate({
      _sum: { collected_amount: true },
    });
    const totalUser = await prisma.accounts.count({
      where: { role: "user" },
    });
    const totalAdmin = await prisma.accounts.count({
      where: { role: "admin" },
    });

    // Data response
    res.json({
      total_campaign: totalCampaign,
      total_donasi: totalDana._sum.collected_amount || 0,
      total_donatur: totalUser + totalAdmin,
      donasiBulanan: donasiBulananArray,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
