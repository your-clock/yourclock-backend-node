const express = require('express');
const router = express.Router();
const usersController = require('../controller/api/userControllerAPI');

router.post('/login', usersController.userLogin);
router.post('/auth', usersController.authUser);
router.delete('/deleteaccount', usersController.deleteUser);
router.post('/verify', usersController.verifyUser);
router.post('/forgotpassword', usersController.forgotPasswordUser);
router.post('/recoverypassword', usersController.recoveryPasswordUser);

module.exports = router;