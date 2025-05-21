const Account = require('../model/accountModel');

// GET semua akun
exports.getAllAccounts = async (req, res) => {
  try {
    const users = await Account.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET akun berdasarkan ID
exports.getAccountById = async (req, res) => {
  try {
    const user = await Account.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST akun baru
exports.createAccount = async (req, res) => {
  try {
    const newUser = await Account.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
};

// DELETE akun
exports.deleteAccount = async (req, res) => {
  try {
    const user = await Account.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Account.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
