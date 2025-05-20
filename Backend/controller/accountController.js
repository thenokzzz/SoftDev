const Account = require('../model/accountModel');

exports.getAllAccounts = async (req, res) => {
  try {
    const users = await Account.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const user = await Account.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const newUser = await Account.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(req.body);
  } 
};  

exports.deleteAccount = async (req, res) => {
  try {
    const deletedUser = await Account.delete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
