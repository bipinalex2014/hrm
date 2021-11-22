var express = require('express');
var router = express.Router();
var publicHelper = require('../helpers/public-helper')


router.get('/login', (req, res) => {
    
    res.render('public/login')
})
router.post('/login', (req, res) => {
    let logindata = req.body
    publicHelper.doLogin(logindata).then((data) => {
        console.log("response status>>>>", data)
        if (data.status) {
            req.session.loggedIn = true
            req.session.empid = data.id
            console.log("gggggg", req.session)
            res.redirect('/public/home')
        }
        else {
            res.render('public/login', { data, message: "incorrect username or password" })
        }
    })
})

router.get('/logout', function (req, res, next) {
    if (req.session.loggedIn) {
        req.session.destroy()
        // console.log('session>>>>',req.session)
        res.redirect('/')
        // res.clearCookie('name', { path: '/doctor' });
        // res.redirect(req.get('referer'));
        // window.location.reload()
        // res.redirect('back')
        // res.redirect('/doctor')
    }
    else{
        res.redirect('/')
    }
});

router.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        res.render('public/home', { public: true })
    }
    else {
        // res.redirect('/public/login')
        res.redirect('/')
    }

})
router.get('/employee-leave', (req, res) => {
    if (req.session.loggedIn) {
        let empid = req.session.empid
        console.log("employee session",req.session)
        publicHelper.getEmploye(empid).then((data) => {
            res.render('public/employee-leave', { public: true, data })
        })
    }
    else {
        // res.redirect('/public/login')
        res.redirect('/')
    }


})
router.post('/employee-leave-form', (req, res) => {
    if (req.session.loggedIn) {
        let leavedata = req.body
        leavedata.empid = req.session.empid
        let empid = req.session.empid
        console.log("leave data>>>>>", leavedata)
        publicHelper.setEmployeeLeaveData(leavedata, empid).then((data) => {
            // if(data.status){
            //     res.render('public/employee-leave', { public:true,data })
            // }
            // else{
            console.log("message>>>", data)
            // res.render('public/employee-leave', { public: true, data })
            // }
            res.json(data)

        })
    }
    else {
        // res.redirect('/public/login')
        res.redirect('/')
    }

})


module.exports = router;