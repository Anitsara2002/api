var express = require('express');
var router = express.Router();

// PASSPORT
const passport = require('passport');

//JWT
var jwt = require('jsonwebtoken');
const requireUserSignIn = passport.authenticate("user-local", { session : false});
const requireJwt = passport.authenticate("jwt", { session : false})


// SIGN IN | USER
router.post("/user", requireUserSignIn, (req, res, next) => {
    var token = jwt.sign({ id: req.user.id }, "api-development", {expiresIn : "2y" });
    res.send({ success : { message : req.__('success.signin'), token, token_type : "bearer", user : req.user}});
});
router.get("/profile", requireJwt, (req, res, next) => {
    res.send(req.user);
});

module.exports = router;