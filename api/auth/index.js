const router = require("express").Router({mergeParams: true});
const passport = require("passport");

router.use(passport.initialize());

router.use('/facebook', require('./facebook'));
router.use('/google', require('./google'));
router.use('/square', require('./square'));

module.exports = router;