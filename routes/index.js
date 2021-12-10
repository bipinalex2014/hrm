var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const dateFormat = require('dateformat');
const pdfCreator = require('../helpers/create-pdf');
const collections = require('../configurations/collections');
const commonHelper = require('../helpers/common-helper');
const e = require('express');


router.get('/', function (req, res) {
  if (req.session.loggedIn) {
    if (req.session.userData.user == "admin") {
      res.redirect('/employee/employee-details')
    }
    else if (req.session.userData.user == "employee") {
      res.redirect('/public/home')
    }

  }
  else {
    res.render('login/login')
  }


})
router.post('/', (req, res) => {
  let logindata = req.body
  userHelper.doLogin(logindata).then((response) => {
    // console.log("response",response)
    if (response.status) {
      req.session.userData = response.signupUserData
      req.session.status = true

      if (response.signupUserData.user == 'employee') {
        req.session.employee = "employee"
        req.session.loggedIn = true
        req.session.empid = response.id
        // console.log("session", req.session)
        res.redirect('/public/home')
        // console.log("success")
      }
      else if (response.signupUserData.user == 'admin') {
        req.session.admin = "admin"
        req.session.loggedIn = true
        req.session.empid = response.id
        // console.log("response", req.session)
        res.redirect('/employee/employee-details')
        // console.log("successrrrr")
      }
    }
    else {
      req.session.logginError = "invalid username or password"
      // res.redirect('/')
      res.render('login/login', { message: "incorrect username or password" })
    }
    // console.log("success")
  })
})
router.get('/crop', (req, res) => {
  res.render('index');
})
//GET METHOD FOR LOAD DEPARTMENTS
router.get('/misc/departments', async (req, res) => {
  //TO GET DEPARTMENTS PRESENTLY IN 
  if (req.session.loggedIn) {
    let dept = await userHelper.getDepartments();
    console.log("data",dept)
    if(dept){
      dept.forEach((element, index) => {
        element.sl = index + 1;
        
      });
    }
    res.render('misc/departments', { admin:true,dept });
   
  }
  else {
    res.redirect('/')
  }


})
//GET METHOD FOR LOAD DESIGNATIONS
router.get('/misc/designations', async (req, res) => {
  //TO GE DESIGNATIONS PRESENTLY IN DATABASE
  if (req.session.loggedIn) {
    let desi = await userHelper.getDesignations();
    console.log("desig",desi)
    if(desi){
      desi.forEach((element, index) => {
        element.sl = index + 1;
      });
    }
    console.log("designation",desi)
    res.render('misc/designations', { admin:true,desi });
  }
  else {
    res.redirect('/')
  }

})
router.get('/misc/get-department-data/:id', (req, res) => {
  if (req.session.loggedIn) {
    let deptId = req.params.id;
    commonHelper.getDocument(collections.DEPARTMENT_COLLECTION, deptId).then((result) => {
      res.json(result);
    })
  }
  else {
    res.redirect('/')
  }

})


router.get('/change-password', (req, res) => {
  res.render('change-password');
})
















//POST METHODS
// TO ADD A NEW DESIGNATION
router.post('/misc/create-designation', (req, res) => {
  if (req.session.loggedIn) {
    let data = req.body;
    userHelper.createDesignation(data).then((result) => {
      res.redirect('/misc/designations');
    })
  }
  else {
    res.redirect('/')
  }


})
//TO ADD A NEW DEPARTMENT
router.post('/misc/create-department', (req, res) => {
  if (req.session.loggedIn) {
    let deptname = req.body.department
    userHelper.createDepartment(deptname).then(() => {
      res.redirect('/misc/departments');
    }).catch(() => {
    })
  }
  else {
    res.redirect('/')
  }

})
router.post('/misc/modify-department', (req, res) => {
  if (req.session.loggedIn) {
    let values = req.body;
    let id = values._id;
    delete values._id;
    commonHelper.updateDocument(collections.DEPARTMENT_COLLECTION, id, values).then(() => {
      res.json({ status: true });
    })
  }
  else {
    res.redirect('/')
  }

})
module.exports = router;
