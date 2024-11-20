var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
var excel = require('exceljs');

var { User } = require("../../../models");

// PASSPORT
const passport = require("passport");
const requireJwt = passport.authenticate("jwt", { session: false });

// MAIL
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//LOG4JS
var { api: logger } = require('../../../services/logger');
var pug = require('pug');

let users = require("../../../data/users.json");
const { isDate } = require('util/types');
const path = require('path');

/* FETCH ALL USERS */
router.get('/', requireJwt, function (req, res, next) {
  logger.info(`INPUT | ${JSON.stringify(req.query)}`);
  let { page = 1, limit = 20, sort = "id", order = "asc", ...filter } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let offset = (page - 1) * limit;

  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    logger.info(`OUTPUT | ${JSON.stringify(data)}`);
    res.send(data);
  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    logger.error(`ERROR | ${code}:${sqlMessage}`);
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  })
});

/* FETCH BY ID */
router.get('/:id', requireJwt, function (req, res, next) {
  User.findByPk(req.params.id).then(data => {
    if (data) {
      res.send(data);
    } else {
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
    }

  })
});

// /* CREATE */
router.post('/', requireJwt,
  body('firstName').notEmpty().trim().escape(),
  body('lastName').notEmpty().trim().escape(),
  body('birthDate').if(body('birthDate').exists()).isDate(),
  body('password').notEmpty().isLength({ min: 4, max: 20 })
    .withMessage("Must be at 4 - 20 charactors.").trim(),
  body('email').notEmpty().isEmail().normalizeEmail(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    } else {

      User.create(req.body).then(data => {
        const { firstName, lastName, email } = data;

        // SEND EMAIL 
        const msg = {
          to: email, from: process.env.SENDGRID_FROM_EMAIL,
          subject: req.__('email.signup.subject', { firstName, lastName }),
          html: pug.renderFile(`views/email/user/signup.pug`, { data })
        }
        sgMail.send(msg).then((result) => {
          logger.info(`[SENDGRID] NOTIFICATION EMAIL - SIGNUP | email is sended to ${email}`);
        }).catch((error) => {
          const { code, message } = error;
          logger.error(`[SENDGRID] NOTIFICATION EMAIL - SIGNUP | ${email} ${code}:${message}`);
        });
        res.send({ success: { message: req.__('success.inserted'), result: data } });
      }).catch((err) => {
        console.log(err.original);
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
      });
      // User.create(req.body).then(data => {
      //   const { firstName, lastName, email } = data;
        
      //   // SEND EMAIL
      //   const msg = {
      //     to: email, from: process.env.SENDGRID_FROM_EMAIL,
      //     subject: `${firstName} ${lastName} - Account ของคุณเปิดให้งานเรียบร้อย`,
      //     html: pug.renderFile(`views/email/user/signup.pug`, { data })
      //   }
      //   sgMail.send(msg).then((result) => {
      //     logger.info(`[SENDGRID] NOTIFICATION EMAIL-SIGNUP | email is sended to ${email}`);
      //   }).catch((error) => {
      //     const { code, message } = error;
      //     logger.error(`[SENDGRID] NOTIFICATION EMAIL-SIGNUP | ${email} ${code} ${message}`);
      //   });
      //   res.send({ success: { message: " Inserted Successfully.", result: data } });
      // }).catch((err) => {
      //   console.log(err.original);
      //   const { original: { code, sqlMessage } } = err;
      //   res.status(400).send({ error: { name: code, message: sqlMessage } });
      // });
    }
  });

//  UPDATE DATA
router.put('/:id', requireJwt,
  body('firstName').if(body('firstName').exists()).notEmpty().trim().escape(),
  body('lastName').if(body('lastName').exists()).notEmpty().trim().escape(),
  body('birthDate').if(body('birthDate').exists()).isDate(),
  body('password').if(body('password').exists()).notEmpty().isLength({ min: 4, max: 20 })
    .withMessage("Must be at 4 - 20 charactors.").trim(),
  body('email').if(body('email').exists()).notEmpty().isEmail().normalizeEmail(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    } else {
      User.update(req.body, { where: { id: req.params.id } }).then(data => {
        console.log(data);
        if (data[0] > 0) {
          User.findByPk(req.params.id).then(data => {
            res.send({ success: { message: "Updated Successfully.", result: data } });
          });
        } else {
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
        }
      }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
      });
    }
  });
// UPDATE SOME DATA
router.patch('/:id', requireJwt,
  body('firstName').if(body('firstName').exists()).trim().escape(),
  body('lastName').if(body('lastName').exists()).trim().escape(),
  body('password').if(body('password').exists()).trim(),
  body('email').if(body('email').exists()).normalizeEmail().trim(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    } else {
      User.update(req.body, { where: { id: req.params.id } }).then(data => {
        console.log(data);
        if (data[0] > 0) {
          User.findByPk(req.params.id).then(data => {
            res.send({ success: { message: "Updated Successfully.", result: data } });
          });
        } else {
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
        }
      }).catch((err) => {
        const { errors: [ValidationErrorItem], original } = err;
        res.status(400).send({
          error: {
            name: original ? original.code : ValidationErrorItem.type,
            message: original ? original.sqlMessage : ValidationErrorItem.message
          }
        });
      });
    }
  });

// DELETE DATA
router.delete('/:id', requireJwt, function (req, res, next) {
  User.findByPk(req.params.id).then(data => {
    if (data != null) {
      data.destroy().then(result => {
        res.send({ success: { message: "Deleted Successfully.", result: data } });
      })
    } else {
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
    }
  })
});

//EXPORT EXCEL
router.get('/report/excel', requireJwt, function (req, res, next) {
  let { page = 1, limit = 20, sort = "id", order = "asc", ...filter } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let offset = (page - 1) * limit;


  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    //EXCEL
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet("USERS");

    // HEADER
    res.setHeader("Content-Type", "application/vnd.openxmlformats");
    res.setHeader("Content-Disposition", "attachment; filename=" + "users.xlsx");

    // EXCEL : HEADER
    let columns = [];
    let paths = ['firstName', 'lastName', 'email', 'password', 'birthDate'];
    paths.forEach(path => {
      columns.push({ header: path, key: path });
    });

    // COLUMNS
    worksheet.columns = columns;
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // AUTO FILTERS
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: worksheet.actualColumnCount } };

    // STYLE
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "F2F3F4" } };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, buttom: { style: "thin" }, right: { style: "thin" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "229954" } };
      cell.alignment = { vertical: "top", wrapText: true };
    });

    //BODY
    data.forEach(row => {
      const row_ = worksheet.addRow(row);
      row_.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, buttom: { style: "thin" }, right: { style: "thin" } };
      });
    });

    // WRITE AND SEND EXCEL FILE 
    workbook.xlsx.write(res).then(function () {
      res.end();
    });


  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  });
});

//EXPORT CSV
router.get('/report/csv', requireJwt, function (req, res, next) {
  let { page = 1, limit = 20, sort = "id", order = "asc", ...filter } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let offset = (page - 1) * limit;


  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    // CSV
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet("USERS");

    // HEADER
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=" + "users.csv");

    // CSV : HEADER
    let columns = [];
    let paths = ['firstName', 'lastName', 'email', 'password', 'birthDate'];
    paths.forEach(path => {
      columns.push({ header: path, key: path });
    });

    // COLUMNS
    worksheet.columns = columns;
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    //BODY
    data.forEach(row => {
      const row_ = worksheet.addRow(row);
    });

    // WRITE AND SEND CSV FILE 
    workbook.csv.write(res).then(function () {
      res.end();
    });


  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  });
})

module.exports = router;
