const express = require('express');
const router = express.Router();
const accountController = require('../controller/accountController');

router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.delete('/:id', accountController.deleteAccount);


module.exports = router;
