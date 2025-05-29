const express = require("express");
require("dotenv").config();
const session = require("express-session");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { midtrans } = require("./controller/midtransController");

const userRoutes = require("./Routes/userRoute");
const authRoutes = require("./Routes/authRoute");
const adminRoutes = require("./Routes/adminRoute");
const campaignRoute = require("./Routes/campaignRoute");
const galeriRoute = require("./Routes/galeriRoute");
const donationRoute = require("./Routes/donationRoute");

const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 jam
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.render("form");
});

app.post("/pay", midtrans);
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use("/uploads", express.static("uploads"));
app.use("/api/accounts", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/", adminRoutes);
app.use("/api", campaignRoute);
app.use("/api", galeriRoute);
app.use("/api", donationRoute);


app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/home.html"));
});
app.get("/campaign", (req, res) => {
  const searchQuery = req.query.q || '';
  res.sendFile(path.join(__dirname, "../Frontend/HTML/campaign.html"));
});
app.get("/galeri", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/galeri.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/about.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/regist.html"));
});
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/profil.html"));
});
app.get("/donation", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/donation.html"));
});
function ensureAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect("/admin/login");
}
app.get("/admin/dashboard", ensureAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML/admin_dashboard.html"));
});

app.get('/api/transaksi', async (req, res) => {
  try {
    const transaksi = await prisma.transaksi.findMany();
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
});

app.get("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.accounts.findUnique({
      where: { id: parseInt(id) },
    });
    if (!result) {
      return res.status(404).json({ error: "Akun tidak ditemukan" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil akun" });
  }
});

app.get("/api/accounts", async (req, res) => {
  try {
    const result = await prisma.accounts.findMany();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data akun" });
  }
});

const bcrypt = require("bcrypt");
app.post("/api/accounts", async (req, res) => {
  const { name, email, password, confirm_password, number_phone } = req.body;
  const role = "user";

  if (!name || !email || !password || !confirm_password || !number_phone) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: "Konfirmasi password tidak cocok" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.accounts.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        number_phone,
      },
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat akun" });
  }
});

app.put("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, number_phone, role } = req.body;
  try {
    const result = await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: { name, email, number_phone, role },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal update user" });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.accounts.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    await prisma.accounts.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus user" });
  }
});


// 🚀 Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});