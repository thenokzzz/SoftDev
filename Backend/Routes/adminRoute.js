const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

router.post("/login", adminController.login);
router.get("/logout", adminController.logout);

module.exports = router;
