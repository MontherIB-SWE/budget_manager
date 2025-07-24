const express = require('express');
const router = express.Router();
const { getUserById, updateUserIncome } = require('../controllers/userController');

router.get('/:id', getUserById);
router.put('/:id/income', updateUserIncome);

module.exports = router;
