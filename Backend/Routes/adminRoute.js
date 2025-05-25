const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controller/adminController");

// 🔐 Middleware proteksi session admin
function ensureAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect("/admin/login");
}

// 📄 Tampilkan halaman login
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
});

// 📄 Dashboard admin yang diproteksi
router.get("/dashboard", ensureAdmin, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../Frontend/HTML/admin_dashboard.html")
  );
});

// 🔑 Login logic
router.post("/login", adminController.login);

// 🔓 Logout logic (pakai POST)
router.post("/logout", adminController.logout);

module.exports = router;
