var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helper');
const dateFormat = require('dateformat');
const pdfCreator = require('../helpers/create-pdf');
const collections = require('../configurations/collections');
const commonHelper = require('../helpers/common-helper');


router.get('/', function (req, res) {
  res.render('login/login')
  // res.redirect('/employee/employee-details')
})
router.post('/',(req,res)=>{
  let logindata = req.body
  userHelper.doLogin(logindata).then((response)=>{
    // console.log("response",response)
    if(response.status){
      req.session.userData=response.signupUserData
      req.session.status=true
     
      if(response.signupUserData.user=='employee'){
        req.session.employee="employee"
        req.session.loggedIn = true
        req.session.empid = response.id
        console.log("session",req.session) 
        res.redirect('/public/home')
        console.log("success")
      }
      else if(response.signupUserData.user=='admin'){
        req.session.admin="admin"
        req.session.loggedIn = true
        req.session.empid = response.id
        console.log("response",req.session)
        res.redirect('/employee/employee-details')
        // console.log("successrrrr")
      }
    }
    else{
      req.session.logginError="invalid username or password"
      // res.redirect('/')
      res.render('login/login',{message: "incorrect username or password"})
    }
    console.log("success")
  })
})
router.get('/crop', (req, res) => {
  res.render('index');
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
router.get('/misc/get-department-data/:id', (req, res) => {
  let deptId = req.params.id;
  commonHelper.getDocument(collections.DEPARTMENT_COLLECTION, deptId).then((result) => {
    res.json(result);
  })
})


router.get('/change-password', (req, res) => {
  res.render('change-password');
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
router.post('/misc/modify-department', (req, res) => {
  let values = req.body;
  let id = values._id;
  delete values._id;
  commonHelper.updateDocument(collections.DEPARTMENT_COLLECTION, id, values).then(() => {
    res.json({ status: true });
  })
})
module.exports = router;
