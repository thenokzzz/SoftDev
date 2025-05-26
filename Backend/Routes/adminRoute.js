const express = require("express");
const path = require("path");
const router = express.Router();
const adminController = require("../controller/adminController");

function ensureAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect("/admin/login");
}
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/HTML/admin_login.html"));
});

router.get("/dashboard", ensureAdmin, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../Frontend/HTML/admin_dashboard.html")
  );
});

router.post("/login", adminController.login);
router.post("/logout", adminController.logout);

module.exports = router;
