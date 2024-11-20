var passport = require('passport');
var { User } = require('../models');

// LOGGER
var { api: logger } = require('../services/logger');

// CREATE LOCALSTRATEGY
const LocalStrategy = require('passport-local');
const userSignIn = new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    User.findOne({ where: { email } }).then(data => {
        if (!data) {
            return done(null, false);
        }
        if (data.password != password) {
            return done(null, false);
        }
        data.password = undefined;
        logger.addContext('username', data.email);
        return done(null, data);
    });
});

//  CREATE JWT STRATEGY
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;  //ExtractJwt = where can bring token in request
const jwtOptions = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: "api-development" };
const jwtSignIn = new JwtStrategy(jwtOptions, (payload, done) => {
    User.findByPk(payload.id).then(data => {
        if (data) {
            data.password = undefined;
            logger.addContext('username', data.email);
            return done(null, data);
        } else {
            return done(null, false);
        }
    });
})

passport.use('user-local', userSignIn);
passport.use(jwtSignIn);

module.exports = passport;