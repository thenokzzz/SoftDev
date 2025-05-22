const express = require("express");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const userRoutes = require("./Routes/userRoute");
const authRoutes = require("./Routes/authRoute"); // 🔥 tambahkan auth route
const cors = require("cors");
const path = require("path");
const adminRoutes = require("./Routes/adminRoute");
const campaignRoute = require("./Routes/campaignRoute");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const app = express();
const PORT = process.env.PORT || 4000;
const session = require('express-session');

app.use(express.json()); // ⬅️ Middleware untuk parsing JSON (penting!)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use(cors());
app.use("/api/accounts", userRoutes); // Route untuk akun (register, dll)
app.use("/api/auth", authRoutes); // Route untuk login (auth)
app.use("/admin", adminRoutes);
app.use("/api", campaignRoute);
app.use("/uploads", express.static("uploads"));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set secure: true jika pakai HTTPS
}));

// Route test
app.get("/", (req, res) => {
  res.send("Server aktif.");
});

// GET satu akun berdasarkan ID
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

// GET semua akun
app.get("/api/accounts", async (req, res) => {
  try {
    const result = prisma.accounts.findMany();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data akun" });
  }
});

// POST buat akun baru (register)
app.post("/api/accounts", async (req, res) => {
  const { name, email, password, confirm_password, number_phone } = req.body;
  const role = "user";
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!name || !email || !password || !confirm_password || !number_phone) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Konfirmasi password tidak cocok" });
  }
  console.log(req.body); // 🔍 debug input
  try {
    const result = await prisma.accounts.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        number_phone,
      },
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat akun" });
  }
});

// Update user
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

// Delete user
app.delete("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.accounts.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    await prisma.accounts.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (err) {
    console.error("Gagal hapus user:", err);
    res.status(500).json({ error: "Gagal hapus user" });
  }
});

app.post("/api/auth/login", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

// fungsi create campaign
app.post("/api/campaign", upload.single("image"), (req, res) => {
  const { title, description, target_amount } = req.body;
  const image = req.file?.filename || null;

  if (!title || !description || !target_amount) {
    return res.status(400).json({ error: "Semua field harus diisi." });
  }

  // Simpan ke database (image adalah string nama file)
  const newCampaign = {
    title,
    description,
    target_amount,
    image,
  };

  console.log("Campaign baru:", newCampaign);

  res.status(200).json({ message: "Campaign ditambahkan", data: newCampaign });
});

app.get('/api/campaign', async (req, res) => {
  const campaigns = await prisma.campaign.findMany();
  res.json(campaigns);
});

// Update campaign
app.put("/api/campaign/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, target_amount } = req.body;
  let image = req.file?.filename || null;

  if (!title || !description || !target_amount) {
    return res.status(400).json({ error: "Semua field harus diisi." });
  }

  try {
    // Ambil campaign lama dulu (untuk gambar lama)
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: "Campaign tidak ditemukan" });
    }

    // Kalau tidak upload gambar baru, pakai gambar lama
    if (!image) {
      image = existingCampaign.image;
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        target_amount: parseInt(target_amount),
        image,
      },
    });

    res.json({ message: "Campaign berhasil diperbarui", data: updatedCampaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengupdate campaign" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
