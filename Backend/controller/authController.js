const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi" });
  }

  try {
    const result = await db.query("SELECT * FROM accounts WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Email tidak ditemukan" });
    }

    const user = result.rows[0]; // Ambil data user dari hasil query

    // Bandingkan password yang diinput user dengan password hash di DB
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
  const role = "user"; // default role user
  console.log(req.body);
  if (!name || !email || !password || !confirm_password || !number_phone) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  // Cek panjang password
  if (password.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }

  // Cek password dan konfirmasi cocok
  if (password !== confirm_password) {
    return res.status(400).json({ error: "Konfirmasi password tidak cocok" });
  }

  try {
    // Cek apakah email sudah digunakan
    const existingUser = await db.query(
      "SELECT * FROM accounts WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      "INSERT INTO accounts(name, email, password, role, number_phone) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, role, number_phone]
    );

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        number_phone: newUser.rows[0].number_phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal melakukan registrasi" });
  }
};
