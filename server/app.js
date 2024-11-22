var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var { default : logger, api : loggerApi } = require('./services/logger');

require('dotenv').config({ path : './sendgrid.env'});
require('./services/passport');

logger.info(`SENDGRID_API_KEY = ${process.env.SENDGRID_API_KEY}`);

var index = require('./routes/indexRoutes');
var authApi = require('./routes/api/users/authRoutes');
var userApi = require('./routes/api/users/userRoutes');
var emailApi = require('./routes/api/emails/emailRoutes');
var soilingApi = require('./routes/api/soiling_ratio/soilingRoutes');
var predictionApi = require('./routes/api/prediction/predictRoutes');

var app = express();
logger.debug("Create Application Server.");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(morgan('dev'));
app.use((req, res, next) => {
  loggerApi.addContext('ip', req.ip);
  loggerApi.addContext('method', req.method);
  loggerApi.addContext('url', req.url);
  next();
})

// LOCALES I18N
var i18n =require('i18n');
i18n.configure({ locals : ['th', 'en'], directory : __dirname + "/locales", queryParameter : 'lang', defaultLocale: 'th' });
app.use(i18n.init);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/auth', authApi);
app.use('/api/users', userApi);
app.use('/api/emails', emailApi);
app.use('/api/soiling_ratio', soilingApi);
app.use('/api/prediction', predictionApi);
logger.info("Install API route path successfully.");


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
logger.info("Install Error handering successfully.");

module.exports = app;
