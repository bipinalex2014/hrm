var express = require('express');
var router = express();
var employeesHelper = require('../helpers/employee-helper');
const attendanceHelper = require('../helpers/attendance-helper');
const dateFormat = require('dateformat');
const collections = require('../configurations/collections');
const commonHelper = require('../helpers/common-helper');

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
router.get('/holidays', (req, res) => {
    attendanceHelper.getAllHolidays().then((result) => {
        console.log(result)
        if (result) {
            result.forEach((element, index) => {
                element.serial = index + 1;
                element.holidaydate = dateFormat(element.holidaydate, "dd-mmm-yyyy");
            });
        }
        res.render('attendance/manage-holidays', { holidays: result });
    })
})
router.get('/get-holiday-data/:hId', (req, res) => {
    let hid = req.params.hId;
    attendanceHelper.getHolidayData(hid).then((result) => {
        res.json({ data: result });
    })
})



















router.post('/create-leave-type', (req, res) => {
    let values = req.body;
    console.log(values);
    attendanceHelper.createLeaveType(values).then(() => {
        res.redirect('/attendance/leave-types')
    })
})
router.post('/new-holiday', (req, res) => {
    let values = req.body;
    attendanceHelper.createHoliday(values).then(() => {
        res.redirect('/attendance/holidays');
    }).catch((errMsg) => {
        res.json({ errMsg });
    })
})
router.post('/modify-holiday', (req, res) => {
    let values = req.body;
    let id = values._id;
    delete (values._id);
    attendanceHelper.modifyHoliday(id, values).then((response) => {
        res.json(response);
    })
})
router.post('/remove-holiday/:id', (req, res) => {
    let id = req.params.id;
    attendanceHelper.removeHoliday(id).then(() => {
        res.json({ status: true });
    })
})
module.exports = router;