const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const usersController = require('../controller/api/userControllerAPI');

router.post('/login', usersController.userLogin);
router.post('/auth', usersController.authUser);
router.post('/deleteaccount', usersController.deleteUser);
router.post('/verify', usersController.verifyUser);
router.post('/forgotpassword', usersController.forgotPasswordUser);
router.post('/recoverypassword', usersController.recoveryPasswordUser);
router.get('/auth/google', usersController.getUrlGoogle);
router.get('/auth/google/callback', passport.authenticate('google'), usersController.callbackGoogle);

module.exports = router;