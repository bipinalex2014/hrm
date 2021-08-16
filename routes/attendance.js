var express = require('express');
var router = express();
var employeesHelper = require('../helpers/employee-helper');
const attendanceHelper = require('../helpers/attendance-helper');

router.get('/attendance-entry', async (req, res) => {
    let employees = await employeesHelper.getAllEmployees();
    res.render('attendance/daily-attendance-entry', { employees });
})
router.get('/leave-types', (req, res) => {
    attendanceHelper.getLeaveTypes().then((result) => {
        res.render('attendance/leave-types', { leaves: result });
    })
})
router.get('/leave-entry', (req, res) => {
    attendanceHelper.getAllActiveLeaveTypes().then((result) => {
        res.render('attendance/leave-entry', { leaves: result });

    })
})



















router.post('/create-leave-type', (req, res) => {
    let values = req.body;
    console.log(values);
    attendanceHelper.createLeaveType(values).then(() => {
        res.redirect('/attendance/leave-types')
    })
})
module.exports = router;