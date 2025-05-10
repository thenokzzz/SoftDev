const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  database: 'namadatabase',
  user: 'postgres',
  password: 'password',
  port: 5432
});

client.connect()
  .then(() => console.log("Terhubung ke database!"))
  .catch(err => console.error("Gagal koneksi:", err));
