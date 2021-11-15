var express = require('express');
var router = express();
const employeeHelper = require('../helpers/employee-helper');
const dateFormat = require('dateformat');
const pdfCreator = require('../helpers/create-pdf');
const collections = require('../configurations/collections');
const commonHelper = require('../helpers/common-helper');
var converter = require('number-to-words');
const { response } = require('express');

router.get('/signup', (req, res) => {
  res.render('admin/signup')
})

router.get('/login', (req, res) => {
  res.render('admin/login')
})

router.post('/login', (req, res) => {
  let data = req.body
  console.log("data>>>>", data)
  employeeHelper.setLoginData(data).then((data) => {
    if (data.status) {
      req.session.loggedIn = true
      res.redirect('/employee/employee-details')
    }
    else {
      res.render('admin/login', { data: "incorrect username or password" })
    }
  })
})

router.get('/logout', function (req, res, next) {
  if (req.session.loggedIn) {
    req.session.destroy()
    // console.log('session>>>>',req.session)
    res.redirect('/employee/login')
    // res.clearCookie('name', { path: '/doctor' });
    // res.redirect(req.get('referer'));
    // window.location.reload()
    // res.redirect('back')
    // res.redirect('/doctor')
  }
});

router.get('/', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/employee/employee-details')
  }
  else {
    res.redirect('/employee/login')
  }

})
router.get('/crop', (req, res) => {
  res.render('index');
})
//GET METHOD FOR LOAD CREATE EMPLOYEE WEB FORM
router.get('/create-employee-profile', async (req, res) => {
  if (req.session.loggedIn) {
    let departments = await employeeHelper.getActiveDepartments();
    //TO GET THE LIST OF DESIGNATIONS WITH STATUS ACTIVE
    let designations = await employeeHelper.getActiveDesignations();
    res.render('employees/create-employee', { admin:true,departments, designations })
  }
  else {
    res.redirect('/employee/login')
  }
  //TO GET THE LIST OF DEPARTMENTS WITH STATUS ACTIVE

})

router.get('/employee-details', (req, res) => {
  //GET DETAILS OF ALL EMPLOYEES
  if (req.session.loggedIn) {
    console.log("session", req.session)
    employeeHelper.getAllEmployees().then((result) => {
      // console.log(result)
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;
        });
      }
      res.render('employees/employees-list', { admin:true,employees: result });
    })
  }
  else {
    res.redirect('/employee/login')
  }

})
//TO GET THE DETAILS OF A SINGLE EMLOYEE
router.get('/employee-details/:id/home', (req, res) => {
  if (req.session.loggedIn) {
    let id = req.params.id;
    employeeHelper.getEmployeeDetails(id).then((result) => {
      console.log(result)
      res.render('employees/employee-home', { admin:true,empData: result });
    })
  }
  else {
    res.redirect('/employee/login')
  }

  //res.render('employees/employee-home');
})
//EMLOYEE QUALIFICATION ROUTE
router.get('/employee-details/:id/qualifications/', async (req, res) => {
  if (req.session.loggedIn) {
    let employeeId = req.params.id;
    employeeHelper.getEmployeeQualifications(employeeId).then((result) => {
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;
          element.educationfrom = dateFormat(element.educationfrom, 'dd-mmm-yyyy');
          element.educationto = dateFormat(element.educationto, 'dd-mmm-yyyy');
        });
      }
      res.render('employees/employee-qualification', { admin:true,empId: employeeId, qualifications: result });
    })
  }
  else {
    res.redirect('/employee/login')
  }

})

//EMPLOYEE WORK EXPERIENCE ROUTE
router.get('/employee-details/:id/work-experience/', (req, res) => {
  if (req.session.loggedIn) {
    let empId = req.params.id;
    employeeHelper.getEmployeeExperiences(empId).then((result) => {
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;
          element.expfrom = dateFormat(element.expfrom, 'dd-mmm-yyyy');
          element.expto = dateFormat(element.expto, 'dd-mmm-yyyy');
        });
      }
      res.render('employees/employee-experience', { admin:true,empId, experiences: result });

    })
  }
  else {
    res.redirect('/employee/login')
  }

})
//EMPLOYEE BANK DETAILS ROUTE
router.get('/employee-details/:id/bank-accounts/', (req, res) => {
  if (req.session.loggedIn) {
    let empId = req.params.id;
    employeeHelper.getEmployeeBankDetails(empId).then((result) => {
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;
        });
      }
      res.render('employees/employee-bank-accounts', { admin:true,empId, accounts: result });
    })
  }
  else {
    res.redirect('/employee/login')
  }

})
//EMPLOYEE EMERGENCY CONTACT DETAILS
router.get('/employee-details/:empid/emargency-contacts/', (req, res) => {
  if (req.session.loggedIn) {
    let empId = req.params.empid;
    employeeHelper.getEmergencyContacts(empId).then((result) => {
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;
        });
      }
      res.render('employees/employee-emergency-contacts', { admin:true,empId, contacts: result })
    })
  }
  else {
    res.redirect('/employee/login')
  }

})
//EMPLOYEE SOCIAL MEDIA LINKS ROUTE
router.get('/employee-details/:id/social-media/', (req, res) => {
  if (req.session.loggedIn) {
    let empId = req.params.id;
    res.render('employees/employee-socialmedia', { admin:true,empId });
  }
  else {
    res.redirect('/employee/login')
  }

})
//TO GET EMPLOYEE CONTRACT DETAILS
router.get('/employee-details/:id/contracts/', async (req, res) => {
  if (req.session.loggedIn) {
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
    res.render('employees/employee-contracts', { admin:true,desi: designations, empId, contracts });
  }
  else {
    res.redirect('/employee/login')
  }

})
// TO GET EMPLOYEE IMIGRATION DETAILS
router.get('/employee-details/:id/imigration', (req, res) => {
  if (req.session.loggedIn) {
    let empId = req.params.id;
    employeeHelper.getImigrations(empId).then((result) => {
      if (result) {
        result.forEach((element, index) => {
          element.serial = index + 1;

        })
      }
      res.render('employees/employee-imigrations', { admin:true,empId, imigrations: result });

    })
  }
  else {
    res.redirect('/employee/login')
  }

})
router.get('/employee-details/:id/view-profile', (req, res) => {
  if (req.session.loggedIn) {
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
      res.render('employees/complete-profile', { admin:true,emp: employeeData })
    })
  }
  else {
    res.redirect('/employee/login')
  }

})

router.get('/employee-details/:id/view-profile/export-pdf', async (req, res) => {
  if (req.session.loggedIn) {
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

  }
  else {
    res.redirect('/employee/login')
  }

})





//POST METHODS

// TO CREATE AN EMPLOYEE PROFILE
router.post('/create-employee-profile', (req, res) => {
  let values = req.body;
  console.log("data>>>", values)
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

router.get('/payroll-details', (req, res) => {
  if (req.session.loggedIn) {
    employeeHelper.getEmployee().then((employees) => {
      console.log(employees)
      res.render('employees/employee-payroll-details', { admin:true,employees })
    })
  }
  else {
    res.redirect('/employee/login')
  }

})

router.get('/payroll', function (req, res) {
  if (req.session.loggedIn) {
    res.render('employees/payroll',{admin:true,})
  }
  else {
    res.redirect('/employee/login')
  }

})

router.get('/get-shift-details/:id', (req, res) => {
  // let employeeId = req.params.id
  // console.log("employee id",employeeId)
  if (req.session.loggedIn) {
    employeeHelper.getShiftDetails().then((data) => {
      let employeeId = req.params.id

      console.log("new data", employeeId)
      res.render('employees/employee-shift-data', { admin:true,data, employeeId })
    })
  }
  else {
    res.redirect('/employee/login')
  }

})

router.post('/get-shift-time/:id', (req, res) => {
  console.log("success")
  const id = req.params.id;
  console.log("id>>>>", id)
  employeeHelper.getShiftTime(id).then((data) => {
    console.log("kkkkkk", data)
    res.json(data)
    // data.employeeId = id
    // console.log("ggggggg",data)
  })
})
router.post('/duty-shift-time/:empid', (req, res) => {
  let data = req.body
  let id = req.params.empid
  // let id = req.params.id
  // console.log("id data",id)
  console.log('data>>>>', req.body)
  console.log('data>>>>', id)
  employeeHelper.setShiftTime(data).then((data) => {
    console.log("data>>>>", data)
    res.redirect('/employee/get-shift-details/' + id)
  })
})
router.get('/employee-salary-slip', (req, res) => {
  if (req.session.loggedIn) {
    employeeHelper.getEmployeeDetailsForSalarySlip().then((data) => {
      res.render('employees/employee-salary-slip', { admin:true,data })
    })
  }
  else {
    res.redirect('/employee/login')
  }


})
router.get('/create-salary-slip/:id', (req, res) => {
  if (req.session.loggedIn) {
    let id = req.params.id
    console.log("id>>>", id)
    employeeHelper.getEmployeeDetailsForSalarySlipForm(id).then((data) => {
      res.render('employees/create-slip', { admin:true,data })
    })

  }
  else {
    res.redirect('/employee/login')
  }

})
router.post('/salary-slip-data/:id', (req, res) => {
  let data = req.body
  let id = req.params.id
  console.log("data>>>>", data)
  employeeHelper.setSalarySlipData(data, id).then((datas) => {
    console.log("data>>>>", datas)
    if (datas) {
      // res.render('employees/create-slip/'+id)
      res.json(datas)
      // res.redirect('/employee/create-salary-slip/'+id)
    }
    else {
      // res.render('employees/employee-salary-slip',{message:"successfully created"})
      // res.json(datas)
      res.redirect('/employee/employee-salary-slip')
      // res.write("<h2>Applied successfully</h2>");
    }

  })
})
router.get('/view-salary-slip/:id', (req, res) => {
  if (req.session.loggedIn) {
    let id = req.params.id
    employeeHelper.getSalarySlipDetails(id).then((data) => {
      const holidays = [
        [7, 4], // 4th of July
        [10, 31], // Halloween
      ];
      var d = new Date();
      var currentDay = d.getDate();
      var year = d.getYear() + 1900;
      var month = d.getMonth();
      var totalDays = 0;
      var done = 0;
      for (var day = 1; day <= 31; day++) {
        var t = new Date(year, month, day);
        if (t.getMonth() > month) break; // month has less than 31 days
        if (t.getDay() == 0 || t.getDay() == 6) continue; // no weekday
        if (holidays.some(h => h[0] - 1 === month && h[1] === day)) continue; // holiday
        totalDays++; // increase total
        if (t.getDate() <= currentDay) done++; // increase past days
      }
      console.log("total days>>>", totalDays)
      day = data.basicSalary / totalDays
      perDay = Math.round(day)
      let salary = perDay * data.attendance
      console.log("perDay>>>", perDay)
      console.log("salary>>>", salary)


      data.dateOfJoining = dateFormat(data.dateOfJoining, "dd-mm-yyyy")
      data.yearAndMonth = dateFormat(new Date(), "mmmm , yyyy")
      netAmount = salary + data.convayanceAllowance + data.leaveTravelAllowance + data.houseRentAllowance + data.additionalhra + data.medicalAllowance + data.transportAllowance + data.superAnnuationAllowance + data.lunchAllowance + data.providentFund
      data.netAmountWord = converter.toWords(netAmount)
      data.netAmount = netAmount
      data.totalDays = totalDays
      data.perDay = perDay
      data.salary = salary
      console.log("new data>>>>", data)
      res.render('employees/view-salary-slip', { admin:true,data })
    })

  }
  else {
    res.redirect('/employee/login')
  }

})


module.exports = router;