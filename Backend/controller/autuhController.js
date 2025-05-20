const db = require('../config/db');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Cek kalau field kosong
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const result = await db.query('SELECT * FROM accounts WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    const user = result.rows[0];

    // Cek password (asumsi belum hash, kalau sudah hash pakai bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Berhasil login
    res.status(200).json({ message: 'Login berhasil', user });
  } catch (err) {
    res.status(500).json({ error: 'Gagal login' });
  }
};
