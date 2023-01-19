var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { validate, ValidationError, Joi } = require('express-validation')


var indexRouter = require('./routes/index');
var steamRouter = require('./routes/steam');
var leaderboards = require('./routes/leaderboards');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/api/steam', steamRouter);
app.use('/api/leaderboards', leaderboards);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err instanceof ValidationError)
    return res.status(err.statusCode).json(err)

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
