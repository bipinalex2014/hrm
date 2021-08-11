var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');

router.get('/employee/create-employee-profile', async (req, res) => {
  let departments = await userHelper.getActiveDepartments();
  let designations = await userHelper.getActiveDesignations();
  res.render('employees/create-employee', { departments, designations })
})
router.get('/misc/departments', async (req, res) => {
  let dept = await userHelper.getDepartments();
  dept.forEach((element, index) => {
    element.sl = index + 1;
  });
  res.render('misc/departments', { dept });
})
router.post('/misc/create-department', (req, res) => {
  let deptname = req.body.department
  // console.log(deptname)
  userHelper.createDepartment(deptname).then(() => {
    res.redirect('/misc/departments');
  }).catch(() => {
    // res.json({ status: false });
  })
})
router.get('/misc/designations', async (req, res) => {

  let desi = await userHelper.getDesignations();
  desi.forEach((element, index) => {
    element.sl = index + 1;
  });
  res.render('misc/designations', { desi });
})
router.post('/misc/create-designation', (req, res) => {
  let data = req.body;
  // console.log(data);
  userHelper.createDesignation(data).then((result) => {
    res.redirect('/misc/designations');
  })

})
module.exports = router;
