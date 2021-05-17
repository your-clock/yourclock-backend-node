const express = require('express');
const router = express.Router();
const relojController = require('../controller/api/relojControllerAPI');

router.post('/datos', relojController.setData);
router.post('/alarma', relojController.setAlarm);

module.exports = router;
