var express = require('express');
var router = express.Router();

router.get('/employee/create-employee-profile', (req, res) => {
  res.render('employees/create-employee')
})

module.exports = router;
