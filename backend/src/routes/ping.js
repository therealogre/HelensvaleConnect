const express = require('express');
const router = express.Router();
const { pingController } = require('../controllers/ping');

router.get('/', pingController);

module.exports = router;