const express = require('express');
require('dotenv').config();
const db = require('./config/db'); // koneksi database
const userRoutes = require('./Routes/userRoute');
const authRoutes = require('./Routes/authRoute'); // 🔥 tambahkan auth route
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;



app.use(express.json()); // ⬅️ Middleware untuk parsing JSON (penting!)
app.use(cors());
app.use('/api/accounts', userRoutes);   // Route untuk akun (register, dll)
app.use('/api/auth', authRoutes);       // Route untuk login (auth)

// Route test
app.get('/', (req, res) => {
  res.send('Server aktif.');
});

// GET satu akun berdasarkan ID
app.get('/api/accounts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM accounts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Akun tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil akun' });
  }
});

// GET semua akun
app.get('/api/accounts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accounts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data akun' });
  }
});

// POST buat akun baru (register)
app.post('/api/accounts', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body); // 🔍 debug input
  try {
    const result = await db.query(
      'INSERT INTO accounts(name, email, password) VALUES($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat akun' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
