const db = require('../config/db');

const Account = {
  async findAll() {
    const result = await db.query('SELECT * FROM accounts');
    return result.rows;
  },

  async findById(id) {
    const result = await db.query('SELECT * FROM accounts WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, email, password }) {
    const result = await db.query(
      'INSERT INTO accounts(name, email, password) VALUES($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query('DELETE FROM accounts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Account;
