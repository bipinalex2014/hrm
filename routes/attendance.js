var express = require('express');
var router = express();
var employeesHelper = require('../helpers/employee-helper');
const attendanceHelper = require('../helpers/attendance-helper');
const dateFormat = require('dateformat');
const collections = require('../configurations/collections');
const commonHelper = require('../helpers/common-helper');
const { Db } = require('mongodb');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require('path');
var mime = require('mime');
var xl = require('excel4node')
var qrcode = require('qrcode')

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

router.get('/todays-attendance', (req, res) => {

    attendanceHelper.doAttendance().then((employees) => {
        res.render('attendance/todays-attendance', { employees })
    })
})
router.get('/get-employee-details/:id', (req, res) => {
    let id = req.params.id
    attendanceHelper.getEmployeeDetails(id).then((data) => {
        res.render('attendance/make-attendance', { data })
    })
})
router.post('/attendance-data', (req, res) => {
    let data = req.body
    attendanceHelper.setEmployeeAttendance(data).then((data) => {
        res.redirect('/attendance/todays-attendance')
    })
})
router.get('/add-overtime', (req, res) => {
    attendanceHelper.setOvertime().then((data) => {
        res.render('attendance/add-overtime', { data })
    })

})
router.post('', (req, res) => {
    attendanceHelper
})

router.get('/duty-shift', (req, res) => {

    attendanceHelper.getDutyShiftData().then((data) => {
        res.render('attendance/duty-shift', { data })

    })

})

router.post('/duty-shift-data', (req, res) => {
    let data = req.body
    attendanceHelper.setDutyShift(data).then((data) => {
        res.redirect('/attendance/duty-shift')
    })
})
router.get('/delete-shift/:id', (req, res) => {
    let dataId = req.params.id
    attendanceHelper.deleteSift(dataId).then((data) => {
        res.redirect('/attendance/duty-shift')
    })

})
router.get('/mark-employees-attendance', (req, res) => {
    attendanceHelper.getAllEmployeesData().then((data) => {
        data.forEach((element) => {
            element.todayDate = new Date()
        })
        res.render('attendance/mark-attendance', { data })
    })
})
router.post('/mark-employees-attendance/:id/:date', (req, res) => {
    let data = req.body
    let id = req.params.id
    let date = req.params.date
    attendanceHelper.setTodayAttendance(data, id, date).then((data) => {
        console.log("success data", data)
        if (data.acknowledged) {
            res.render('attendance/mark-attendance', { data })
        }
        else {
            data.forEach((element) => {
                element.todayDate = new Date()
            })
            res.render('attendance/mark-attendance', { data })
        }

    })
})
router.get('/view-attendance', (req, res) => {
    attendanceHelper.viewEmployeeAttendance().then((data) => {
        res.render('attendance/view-attendance', { data })
    })
})
router.get('/view-employee-attendance-details/:id', (req, res) => {
    let id = req.params.id
    attendanceHelper.viewEmployeeAttendanceDetails(id).then((data) => {
        res.render('attendance/view-attendance-details', { data })
    })
})
router.get('/getMonthwiseAttendance/', (req, res) => {
    let id = req.query.id
    let month = req.query.month

    attendanceHelper.getMonthwiseAttendanceDetails(id, month).then((data) => {
        data.attendanceData.forEach((element) => {
            element.date = dateFormat(element.date, "dddd, mmmm dS, yyyy")
        })
        res.render('attendance/view-attendance-details', { data })
    })
})
router.get('/view-todays-attendance', (req, res) => {
    attendanceHelper.getTodayAttendance().then((data) => {
        data.forEach((element) => {
            element.date = dateFormat(element.date, "dddd, mmmm dS, yyyy")
        })
        res.render('attendance/view-todays-attendance', { data })
    })
})
router.get('/employee-salary', (req, res) => {
    attendanceHelper.getEmployeeSalary().then((data) => {

        // var dt = new Date();
        // var month = dt.getMonth() + 1;
        // var year = dt.getFullYear();
        // var daysInMonth = new Date(year, month, 0).getDate();
        // console.log("number of working days",daysInMonth)
        const holidays = [
            [7, 4], // 4th of July
            [10, 31] // Halloween
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
        data.forEach((element) => {
            element.day = element.basicSalary / totalDays
            element.perDay = Math.round(element.day)
            element.totalDays = totalDays
            element.salary = Math.round(element.day * element.total)
        })
        let add = 0

        for (var i = 0; i < data.length; i++) {
            add += data[i].salary
        }
        data.totalSalary = add

        res.render('attendance/employee-salary', { data })
    })
})
router.get('/edit-today-attendance/:id', (req, res) => {
    let id = req.params.id
    attendanceHelper.getEditingAttendance(id).then((data) => {
        res.render('attendance/edit-today-attendance', { data })
    })
})
router.post('/update-attendance/:id', (req, res) => {
    let data = req.body
    let id = req.params.id
    attendanceHelper.updateEmployeeAttendance(data, id).then((data) => {
        res.redirect('/attendance/view-todays-attendance')
    })
})
router.get('/pdf-creator', (req, res) => {


    attendanceHelper.pdfGenerator().then((data) => {

        // var dt = new Date();
        // var month = dt.getMonth() + 1;
        // var year = dt.getFullYear();
        // var daysInMonth = new Date(year, month, 0).getDate();
        // console.log("number of working days",daysInMonth)
        const holidays = [
            [7, 4], // 4th of July
            [10, 31] // Halloween
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

        data.forEach((element) => {

            element.day = element.basicSalary / totalDays
            element.perDay = Math.round(element.day)
            element.totalDays = totalDays
            element.salary = Math.round(element.day * element.total)
        })

        let add = 0

        for (var i = 0; i < data.length; i++) {
            add += data[i].salary
        }
        data.totalSalary = add


        var html = fs.readFileSync(path.join(__dirname, '../views/attendance/template.hbs'), 'utf-8');
        var filename = 'output.pdf'//Math.random() + '_doc' + '.pdf';
        var options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            header: {
                height: "45mm",
                contents: '<h1 style="text-align: center;">Salary Details</h1>'
            },
            footer: {
                height: "28mm",
                contents: {
                    first: 'Cover page',
                    2: 'Second page', // Any page number is working. 1-based index
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: 'Last Page'
                }
            }
        };

        var document = {
            html: html,
            data: {
                data: data,
            },
            path: "./docs/" + filename,
            type: "",
        };
        pdf.create(document, options).then(() => {
            res.download('./docs/' + filename);
        }).catch((error) => {
            console.error(error);
        });
    })

})

router.get('/excel-creator', (req, res) => {

    attendanceHelper.excelGenerator().then((data) => {

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
        data.forEach((element, index) => {

            day = element.basicSalary / totalDays
            perDay = Math.round(day)
            basicSalary = element.basicSalary
            total = element.total
            element._id = index.toString()
            element.total = total.toString()
            element.basicSalary = basicSalary.toString()
            element.perDay = perDay.toString()
            element.totalDays = totalDays.toString()
            element.salary = Math.round(day * element.total).toString()

        })
        let add = 0

        for (var i = 0; i < data.length; i++) {
            add += data[i].salary
        }
        data.totalSalary = add
        const headerColumns = ["Index", "Name", "Basic Salary", "Total Working Days", "Total Attendance", "Salary per Day", "Total Salary"]
        const wb = new xl.Workbook()
        var options = {
            margins: {
                left: 1.5,
                right: 1.5,
            },
        };
        const ws = wb.addWorksheet('sheetname', options)
        let colIndex = 1
        headerColumns.forEach((item) => {
            ws.cell(1, colIndex++).string(item)

        })
        let rowIndex = 2
        data.forEach((item) => {
            let columnIndex = 1;
            Object.keys(item).forEach((colName) => {
                ws.cell(rowIndex, columnIndex++).string(item[colName])

            })
            rowIndex++
        })
        wb.write("sheetname.xlsx")
        const file = './' + 'sheetname.xlsx'
        setTimeout(() => {
            res.download(file)
        }, 1000)


    })

})

router.get('/qrcode', (req, res) => {

    res.render('attendance/qrcode')
})
router.post('/scan', (req, res) => {
    let url = req.body.url
    console.log('url>>>>', url)
    qrcode.toDataURL(url)
        .then(url => {
            console.log(url)
            res.render('attendance/qrscan',{url})
        })
        .catch(err => {
            console.error(err)
        })
})
module.exports = router;



