const router = require('express').Router();
const controller = require('./auth.controller');

router.post('/register' , controller.register);
router.post('/login' , controller.login);
router.post('/google', controller.googleAuth);
module.exports = router;