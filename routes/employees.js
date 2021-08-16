var express = require('express');
var router = express();
const employeeHelper = require('../helpers/employee-helper');
const dateFormat = require('dateformat');
const pdfCreator = require('../helpers/create-pdf');



router.get('/', function (req, res) {
  res.redirect('/employee/employee-details')
})
router.get('/crop', (req, res) => {
  res.render('index');
})
//GET METHOD FOR LOAD CREATE EMPLOYEE WEB FORM
router.get('/create-employee-profile', async (req, res) => {
  //TO GET THE LIST OF DEPARTMENTS WITH STATUS ACTIVE
  let departments = await employeeHelper.getActiveDepartments();
  //TO GET THE LIST OF DESIGNATIONS WITH STATUS ACTIVE
  let designations = await employeeHelper.getActiveDesignations();
  res.render('employees/create-employee', { departments, designations })
})

router.get('/employee-details', (req, res) => {
  //GET DETAILS OF ALL EMPLOYEES
  employeeHelper.getAllEmployees().then((result) => {
    // console.log(result)
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
      });
    }
    res.render('employees/employees-list', { employees: result });
  })
})
//TO GET THE DETAILS OF A SINGLE EMLOYEE
router.get('/employee-details/:id/home', (req, res) => {
  let id = req.params.id;
  employeeHelper.getEmployeeDetails(id).then((result) => {
    console.log(result)
    res.render('employees/employee-home', { empData: result });
  })
  //res.render('employees/employee-home');
})
//EMLOYEE QUALIFICATION ROUTE
router.get('/employee-details/:id/qualifications/', async (req, res) => {
  let employeeId = req.params.id;
  employeeHelper.getEmployeeQualifications(employeeId).then((result) => {
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

//EMPLOYEE WORK EXPERIENCE ROUTE
router.get('/employee-details/:id/work-experience/', (req, res) => {
  let empId = req.params.id;
  employeeHelper.getEmployeeExperiences(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
        element.expfrom = dateFormat(element.expfrom, 'dd-mmm-yyyy');
        element.expto = dateFormat(element.expto, 'dd-mmm-yyyy');
      });
    }
    res.render('employees/employee-experience', { empId, experiences: result });

  })
})
//EMPLOYEE BANK DETAILS ROUTE
router.get('/employee-details/:id/bank-accounts/', (req, res) => {
  let empId = req.params.id;
  employeeHelper.getEmployeeBankDetails(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
      });
    }
    res.render('employees/employee-bank-accounts', { empId, accounts: result });
  })
})
//EMPLOYEE EMERGENCY CONTACT DETAILS
router.get('/employee-details/:empid/emargency-contacts/', (req, res) => {
  let empId = req.params.empid;
  employeeHelper.getEmergencyContacts(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
      });
    }
    res.render('employees/employee-emergency-contacts', { empId, contacts: result })
  })
})
//EMPLOYEE SOCIAL MEDIA LINKS ROUTE
router.get('/employee-details/:id/social-media/', (req, res) => {
  let empId = req.params.id;
  res.render('employees/employee-socialmedia', { empId });
})
//TO GET EMPLOYEE CONTRACT DETAILS
router.get('/employee-details/:id/contracts/', async (req, res) => {
  let empId = req.params.id;
  let designations = await employeeHelper.getActiveDesignations();
  let contracts = await employeeHelper.getContracts(empId)
  if (contracts) {
    contracts.forEach((element, ind) => {
      element.serial = ind + 1;
      element.contrfrom = dateFormat(element.contrfrom, "dd-mmm-yyyy");
      element.contrto = dateFormat(element.contrto, "dd-mmm-yyyy");
    });

  }
  console.log(contracts);
  res.render('employees/employee-contracts', { desi: designations, empId, contracts });
})
// TO GET EMPLOYEE IMIGRATION DETAILS
router.get('/employee-details/:id/imigration', (req, res) => {
  let empId = req.params.id;
  employeeHelper.getImigrations(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;

      })
    }
    res.render('employees/employee-imigrations', { empId, imigrations: result });

  })
})
router.get('/employee-details/:id/view-profile', (req, res) => {
  let employee = req.params.id;
  employeeHelper.getCompleteProfile(employee).then((employeeData) => {
    employeeData.dateofbirth = dateFormat(employeeData.dateofbirth, "dd-mmm-yyyy");
    employeeData.dateofjoin = dateFormat(employeeData.dateofjoin, "dd-mmm-yyyy");
    if (employeeData.qualifications) {
      employeeData.qualifications.forEach((element) => {
        element.educationfrom = dateFormat(element.educationfrom, "dd-mm-yyyy");
        element.educationto = dateFormat(element.educationto, "dd-mm-yyyy");
      });
    }
    if (employeeData.experiecnes) {
      employeeData.experiences.forEach((element) => {
        element.expfrom = dateFormat(element.expfrom, "dd-mm-yyyy");
        element.expto = dateFormat(element.expto, "dd-mm-yyyy");
      });
    }
    if (employeeData.contracts) {
      employeeData.contracts.forEach((element) => {
        element.contrfrom = dateFormat(element.contrfrom, "dd-mm-yyyy");
        element.contrto = dateFormat(element.contrto, "dd-mm-yyyy");
      });

    }
    res.render('employees/complete-profile', { emp: employeeData })
  })
})

router.get('/employee-details/:id/view-profile/export-pdf', async (req, res) => {
  let empId = req.params.id;
  let employeeData = await employeeHelper.getCompleteProfile(empId);
  employeeData.dateofbirth = dateFormat(employeeData.dateofbirth, "dd-mmm-yyyy");
  employeeData.dateofjoin = dateFormat(employeeData.dateofjoin, "dd-mmm-yyyy");
  if (employeeData.qualifications) {
    employeeData.qualifications.forEach((element) => {
      element.educationfrom = dateFormat(element.educationfrom, "dd-mm-yyyy");
      element.educationto = dateFormat(element.educationto, "dd-mm-yyyy");
    });
  }
  if (employeeData.experiecnes) {
    employeeData.experiences.forEach((element) => {
      element.expfrom = dateFormat(element.expfrom, "dd-mm-yyyy");
      element.expto = dateFormat(element.expto, "dd-mm-yyyy");
    });
  }
  if (employeeData.contracts) {
    employeeData.contracts.forEach((element) => {
      element.contrfrom = dateFormat(element.contrfrom, "dd-mm-yyyy");
      element.contrto = dateFormat(element.contrto, "dd-mm-yyyy");
    });

  }
  // console.log(empData);
  pdfCreator.generateEmployeeProfile(employeeData).then((path) => {
    res.download(path);
  }).catch((err) => {
    console.log(err);
  })
})





//POST METHODS

// TO CREATE AN EMPLOYEE PROFILE
router.post('/create-employee-profile', (req, res) => {
  let values = req.body;
  employeeHelper.createEmployee(values).then((result) => {
    res.redirect('/employee/employee-details');
  })
})
//TO ADD A QUALIFICATION TO AN EMPLOYEE
router.post('/employee-details/:id/create-qualification', (req, res) => {
  let employee = req.params.id;
  let qualification = req.body;
  let document = req.files.educationdocument;
  let fileName = employee + qualification.educationlevel + document.name + '';
  qualification.filename = fileName;
  employeeHelper.newQualification(employee, qualification).then(() => {
    document.mv('./public/documents/education/' + fileName, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/employee-details/' + employee + '/qualifications');
      }
    });
  })
})
//TO ADD AN EXPERINCE TO EMPLOYEE
router.post('/employee-details/:id/create-experience', (req, res) => {
  let employee = req.params.id;
  let experience = req.body;
  let document = req.files.expdocument;
  let fileName = employee + experience.post + experience.expcompany + document.name + '';
  experience.filename = fileName;
  employeeHelper.newExperience(employee, experience).then((result) => {
    document.mv('./public/documents/experience/' + fileName, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/employee/employee-details/' + employee + '/bank-accounts');
      }
    });
  })

})
//TO ADD BANK DETAILS OF AN EMPLOYEE
router.post('/employee-details/:id/create-bank-details', (req, res) => {
  let employee = req.params.id;
  let accountdetails = req.body;
  employeeHelper.newAccountDetails(employee, accountdetails).then((result) => {
    res.redirect('/employee/employee-details/' + employee + '/bank-accounts');
  })

})
// TO ADD EMPLOYEE EMERGENCY CONTACT DETAILS
router.post('/employee-details/:id/create-emergency-contact', (req, res) => {

  let employee = req.params.id;
  let contact = req.body;
  employeeHelper.newEmergancyContact(employee, contact).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/emargency-contacts/')
  })
})
//TO ADD EMPLOYEE CONTRACT DETAILS
router.post('/employee-details/:id/create-contract', (req, res) => {
  let employee = req.params.id;
  let contracts = req.body;
  //console.log(contracts)
  employeeHelper.newContract(employee, contracts).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/contracts/')
  })
})
//TO ADD IMIGRATION DETAILS OF AN EMPLOYEE
router.post('/employee-details/:id/create-imigration', (req, res) => {
  let employee = req.params.id;
  let imigration = req.body;
  let document = req.files.document;
  let fileName = employee + imigration.doctype + imigration.docname + document.name + '';
  imigration.filename = fileName;
  employeeHelper.newImigration(employee, imigration).then(() => {
    document.mv('./public/documents/imigration/' + fileName, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/employee/employee-details/' + employee + '/imigration')
      }
    });
  })
})
//TO UPDATE EMPLOYEE PROFILE PHOTO
router.post('/employee-details/:id/upload-avatar', function (req, res) {

  let employee = req.params.id;
  let data = req.body;
  let avatar = req.files.avatar;
  let imagepath = employee + 'avatar_image' + avatar.name + '';
  console.log(imagepath);
  employeeHelper.updateAvatar(employee, imagepath).then(() => {
    avatar.mv('./public/documents/profile-avatar/' + imagepath, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/employee/employee-details/' + employee + '/home');
      }
    });

  })
  // res.json('')
})
//TO ADD OR MODIFY SOCIAL MEDIA DATA OF EMPLOYEE
router.post('/employee-details/:id/add-socialmedia', (req, res) => {
  let employee = req.params.id;
  let socialmedia = req.body;
  employeeHelper.updateSocialMedia(employee, socialmedia).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/home');
  })
  console.log(socialmedia)
})

















module.exports = router;