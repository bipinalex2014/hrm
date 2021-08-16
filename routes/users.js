var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const dateFormat = require('dateformat');
const pdfCreator = require('../helpers/create-pdf');



router.get('/', function (req, res) {
  res.redirect('/employee/employee-details')
})
router.get('/crop', (req, res) => {
  res.render('index');
})
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
router.get('/employee/employee-details/:id/home', (req, res) => {
  let id = req.params.id;
  userHelper.getEmployeeDetails(id).then((result) => {
    console.log(result)
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

//EMPLOYEE WORK EXPERIENCE ROUTE
router.get('/employee/employee-details/:id/work-experience/', (req, res) => {
  let empId = req.params.id;
  userHelper.getEmployeeExperiences(empId).then((result) => {
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
router.get('/employee/employee-details/:id/bank-accounts/', (req, res) => {
  let empId = req.params.id;
  userHelper.getEmployeeBankDetails(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
      });
    }
    res.render('employees/employee-bank-accounts', { empId, accounts: result });
  })
})
//EMPLOYEE EMERGENCY CONTACT DETAILS
router.get('/employee/employee-details/:empid/emargency-contacts/', (req, res) => {
  let empId = req.params.empid;
  userHelper.getEmergencyContacts(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;
      });
    }
    res.render('employees/employee-emergency-contacts', { empId, contacts: result })
  })
})
//EMPLOYEE SOCIAL MEDIA LINKS ROUTE
router.get('/employee/employee-details/:id/social-media/', (req, res) => {
  let empId = req.params.id;
  res.render('employees/employee-socialmedia', { empId });
})
//TO GET EMPLOYEE CONTRACT DETAILS
router.get('/employee/employee-details/:id/contracts/', async (req, res) => {
  let empId = req.params.id;
  let designations = await userHelper.getActiveDesignations();
  let contracts = await userHelper.getContracts(empId)
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
router.get('/employee/employee-details/:id/imigration', (req, res) => {
  let empId = req.params.id;
  userHelper.getImigrations(empId).then((result) => {
    if (result) {
      result.forEach((element, index) => {
        element.serial = index + 1;

      })
    }
    res.render('employees/employee-imigrations', { empId, imigrations: result });

  })
})
router.get('/employee/employee-details/:id/view-profile', (req, res) => {
  let employee = req.params.id;
  userHelper.getCompleteProfile(employee).then((employeeData) => {
    console.log(employeeData);
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

router.get('/employee/employee-details/:id/view-profile/export-pdf', async (req, res) => {
  let empId = req.params.id;
  let empData = await userHelper.getCompleteProfile(empId);
  // console.log(empData);
  pdfCreator.generateEmployeeProfile(empData).then((path) => {
    res.download(path);
  }).catch((err) => {
    console.log(err);
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
//TO ADD AN EXPERINCE TO EMPLOYEE
router.post('/employee/employee-details/:id/create-experience', (req, res) => {
  let employee = req.params.id;
  let experience = req.body;
  let document = req.files.expdocument;
  let fileName = employee + experience.post + experience.expcompany + document.name + '';
  experience.filename = fileName;
  userHelper.newExperience(employee, experience).then((result) => {
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
router.post('/employee/employee-details/:id/create-bank-details', (req, res) => {
  let employee = req.params.id;
  let accountdetails = req.body;
  userHelper.newAccountDetails(employee, accountdetails).then((result) => {
    res.redirect('/employee/employee-details/' + employee + '/bank-accounts');
  })

})
// TO ADD EMPLOYEE EMERGENCY CONTACT DETAILS
router.post('/employee/employee-details/:id/create-emergency-contact', (req, res) => {

  let employee = req.params.id;
  let contact = req.body;
  userHelper.newEmergancyContact(employee, contact).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/emargency-contacts/')
  })
})
//TO ADD EMPLOYEE CONTRACT DETAILS
router.post('/employee/employee-details/:id/create-contract', (req, res) => {
  let employee = req.params.id;
  let contracts = req.body;
  //console.log(contracts)
  userHelper.newContract(employee, contracts).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/contracts/')
  })
})
//TO ADD IMIGRATION DETAILS OF AN EMPLOYEE
router.post('/employee/employee-details/:id/create-imigration', (req, res) => {
  let employee = req.params.id;
  let imigration = req.body;
  let document = req.files.document;
  let fileName = employee + imigration.doctype + imigration.docname + document.name + '';
  imigration.filename = fileName;
  userHelper.newImigration(employee, imigration).then(() => {
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
router.post('/employee/employee-details/:id/upload-avatar', function (req, res) {

  let employee = req.params.id;
  let data = req.body;
  let avatar = req.files.avatar;
  let imagepath = employee + 'avatar_image' + avatar.name + '';
  console.log(imagepath);
  userHelper.updateAvatar(employee, imagepath).then(() => {
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
router.post('/employees/employee-details/:id/add-socialmedia', (req, res) => {
  let employee = req.params.id;
  let socialmedia = req.body;
  userHelper.updateSocialMedia(employee, socialmedia).then(() => {
    res.redirect('/employee/employee-details/' + employee + '/home');
  })
  console.log(socialmedia)
})

module.exports = router;
