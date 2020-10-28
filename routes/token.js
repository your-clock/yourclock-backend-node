const express = require('express');
const router = express.Router();
const tokenController = require('../controller/api/tokenControllerAPI');

router.post('/updatetoken', tokenController.updateToken);
router.post('/verifytoken', tokenController.verifyToken);
router.post('/createtoken', tokenController.createToken);

module.exports = router;