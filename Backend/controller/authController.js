const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.profileData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token dibutuhkan" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.accounts.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Token tidak valid atau expired" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi" });
  }

  try {
    const user = await prisma.accounts.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "Email tidak ditemukan" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Gagal login", detail: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, confirm_password, number_phone } = req.body;
  const role = "user"; // default

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
    const existingUser = await prisma.accounts.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.accounts.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        number_phone,
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        number_phone: newUser.number_phone,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Gagal melakukan registrasi", detail: err.message });
  }
};

exports.auth = function (req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader); // debug

  const token = authHeader?.split(" ")[1];
  if (!token) {
    console.log("Token tidak ditemukan");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token valid, user:", decoded);
    next();
  } catch (err) {
    console.log("Token tidak valid", err.message);
    return res.status(401).json({ error: "Token tidak valid" });
  }
};
