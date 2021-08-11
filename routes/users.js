var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const dateFormat = require('dateformat');

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
  //GET DETAILS OF ALL EMPLOYEES
  userHelper.getAllEmployees().then((result) => {
    res.render('employees/employees-list', { employees: result });
  })
})
//TO GET THE DETAILS OF A SINGLE EMLOYEE
router.get('/employee/employee-details/:id/home', (req, res) => {
  let id = req.params.id;
  userHelper.getEmployeeDetails(id).then((result) => {
    res.render('employees/employee-home', { empData: result });
  })
  //res.render('employees/employee-home');
})
//EMLOYEE QUALIFICATION ROUTE
router.get('/employee/employee-details/:id/qualifications/', async (req, res) => {
  let employeeId = req.params.id;
  userHelper.getEmployeeQualifications(employeeId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
        element.educationfrom = dateFormat(element.educationfrom, 'dd-mmm-yyyy');
        element.educationto = dateFormat(element.educationto, 'dd-mmm-yyyy');
      });
    }
    res.render('employees/employee-qualification', { empId: employeeId, qualifications: result });
  })
})









//POST METHODS
// TO ADD A NEW DESIGNATION
router.post('/misc/create-designation', (req, res) => {
  let data = req.body;
  userHelper.createDesignation(data).then((result) => {
    res.redirect('/misc/designations');
  })

})
//TO ADD A NEW DEPARTMENT
router.post('/misc/create-department', (req, res) => {
  let deptname = req.body.department
  userHelper.createDepartment(deptname).then(() => {
    res.redirect('/misc/departments');
  }).catch(() => {
  })
})

// TO CREATE AN EMPLOYEE PROFILE
router.post('/employee/create-employee-profile', (req, res) => {
  let values = req.body;
  userHelper.createEmployee(values).then((result) => {
    res.redirect('/employee/employee-details');
  })
})
//TO ADD A QUALIFICATION TO AN EMPLOYEE
router.post('/employee/employee-details/:id/create-qualification', (req, res) => {
  let employee = req.params.id;
  let qualification = req.body;
  let document = req.files.educationdocument;
  let fileName = employee + qualification.educationlevel + document.name + '';
  qualification.filename = fileName;
  userHelper.newQualification(employee, qualification).then(() => {
    document.mv('./public/documents/education/' + fileName, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/employee/employee-details/' + employee + '/qualifications');
      }
    });
  })
})

module.exports = router;
