var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');

//GET METHOD FOR LOAD CREATE EMPLOYEE WEB FORM
router.get('/employee/create-employee-profile', async (req, res) => {
  //TO GET THE LIST OF DEPARTMENTS WITH STATUS ACTIVE
  let departments = await userHelper.getActiveDepartments();
  //TO GET THE LIST OF DESIGNATIONS WITH STATUS ACTIVE
  let designations = await userHelper.getActiveDesignations();
  res.render('employees/create-employee', { departments, designations })
})
//GET METHOD FOR LOAD DEPARTMENTS
router.get('/misc/departments', async (req, res) => {
  //TO GET DEPARTMENTS PRESENTLY IN DATABASE
  let dept = await userHelper.getDepartments();
  dept.forEach((element, index) => {
    element.sl = index + 1;
  });
  res.render('misc/departments', { dept });
})
//GET METHOD FOR LOAD DESIGNATIONS
router.get('/misc/designations', async (req, res) => {
  //TO GE DESIGNATIONS PRESENTLY IN DATABASE
  let desi = await userHelper.getDesignations();
  desi.forEach((element, index) => {
    element.sl = index + 1;
  });
  res.render('misc/designations', { desi });
})

router.get('/employee/employee-details', (req, res) => {
  userHelper.getAllEmployees().then((result) => {
    res.render('employees/employees-list', { employees: result });
  })
})











//POST METHODS
router.post('/misc/create-designation', (req, res) => {
  let data = req.body;
  // console.log(data);
  userHelper.createDesignation(data).then((result) => {
    res.redirect('/misc/designations');
  })

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

router.post('/employee/create-employee-profile', (req, res) => {
  let values = req.body;
  // console.log(values);
  userHelper.createEmployee(values).then((result) => {
    res.redirect('/employee/employee-details');
  })
})

module.exports = router;
