var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')

var db = require('./configurations/mongodb-connection');
var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var employeeRouter = require('./routes/employees');
var attendanceRouter = require('./routes/attendance');
var session = require('express-session')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// var hbss = hbs.create({});
var hbss = hbs.create({ 
  helpers: {
    when: (operand_1, operator, operand_2, options) => {
      let operators = {                     //  {{#when <operand1> 'eq' <operand2>}}
        'eq': (l,r) => l == r,              //  {{/when}}
        'noteq': (l,r) => l != r,
        'gt': (l,r) => (+l) > (+r),                        // {{#when var1 'eq' var2}}
        'gteq': (l,r) => ((+l) > (+r)) || (l == r),        //               eq
        'lt': (l,r) => (+l) < (+r),                        // {{else when var1 'gt' var2}}
        'lteq': (l,r) => ((+l) < (+r)) || (l == r),        //               gt
        'or': (l,r) => l || r,                             // {{else}}
        'and': (l,r) => l && r,                            //               lt
        '%': (l,r) => (l % r) === 0                        // {{/when}}
      }
      let result = operators[operator](operand_1,operand_2);
      if(result) return options.fn(this); 
      return options.inverse(this);   
    }    
  }
 });
// hbs.registerHelper("if", (operand_1, operator, operand_2, options) => {
//   let operators = {                     //  {{#when <operand1> 'eq' <operand2>}}
//     'eq': (l,r) => l == r,              //  {{/when}}
//     'noteq': (l,r) => l != r,
//     'gt': (l,r) => (+l) > (+r),                        // {{#when var1 'eq' var2}}
//     'gteq': (l,r) => ((+l) > (+r)) || (l == r),        //               eq
//     'lt': (l,r) => (+l) < (+r),                        // {{else when var1 'gt' var2}}
//     'lteq': (l,r) => ((+l) < (+r)) || (l == r),        //               gt
//     'or': (l,r) => l || r,                             // {{else}}
//     'and': (l,r) => l && r,                            //               lt
//     '%': (l,r) => (l % r) === 0                        // {{/when}}
//   }
//   let result = operators[operator](operand_1,operand_2);
//   if(result) return options.fn(this); 
//   return options.inverse(this);       
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.use(session({secret:'key',cookie:{maxAge:6000000}}))
// app.use('/docs', express.static(path.join(__dirname, 'docs')))
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/public', publicRouter);
app.use('/employee', employeeRouter);
app.use('/attendance', attendanceRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  res.render('error-404', { layout: null })
});
db.connect((err) => {
  if (err) console.log('Failed to connect database ' + err);
  else console.log('Connected to database with port 27017');
})
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
