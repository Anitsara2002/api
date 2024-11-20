var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
// SENDGRID
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// PASSPORT
const passport = require("passport");
const requireJwt = passport.authenticate("jwt", { session: false });

//LOG4JS
var { api: logger } = require('../../../services/logger');

router.post('/send', requireJwt, 
body('to').not().isEmpty().isEmail(),
body('subject').not().isEmpty().trim(),
body('text').not().isEmpty().trim(),
body('html').not().isEmpty().trim(),
(req, res, next) => {

    //  VALIDATE

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array() });
    } else {
        const { to, subject, text, html } = req.body;
        const from = process.env.SENDGRID_FROM_EMAIL;
        logger.info(`INPUT | ${JSON.stringify(req.body)}`);
        const msg = {to, from, subject,text,html };
        logger.info(`[SENDGRID] MSG | ${JSON.stringify(msg)}`);
        sgMail.send(msg).then((result) => {
               logger.info(`[SENDGRID] | email is sended to ${to} `);
               res.send({ success : { message : `email is sended to ${to} `, result }});
            }).catch((error) => {
                const { code, message } = error;
                logger.error (`[SENDGRID] | ${code}:${message}`);
                res.status(400).send({ error : { name : code, message}});
            })
    }


});

module.exports = router;