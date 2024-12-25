const express = require('express');
const { registerTradeperson, loginTradeperson } = require('../controllers/tradepersonController');

const router = express.Router();

router.post('/register', registerTradeperson);
router.post('/login', loginTradeperson);

module.exports = router;
