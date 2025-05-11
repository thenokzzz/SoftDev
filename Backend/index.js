const express = require('express');
require('dotenv').config();
require('./config/db'); // panggil koneksi database

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server aktif.');
});

app.listen(PORT, () => {
  console.log(` Server berjalan di http://localhost:${PORT}`);
});
