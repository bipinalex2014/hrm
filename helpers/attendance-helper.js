const Promise = require("promise");
const db = require("../configurations/mongodb-connection");
const collections = require("../configurations/collections");
const { ObjectId } = require("mongodb");
const { resolve, reject } = require("promise");
const dateFormat = require("dateformat");
const nodemailer = require("nodemailer");

module.exports = {
  getLeaveTypes: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.LEAVE_TYPE_COLLECTION)
        .find()
        .toArray()
        .then((result) => {
          resolve(result);
        });
    });
  },

  createLeaveType: (values) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.LEAVE_TYPE_COLLECTION)
        .insertOne(values)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  getAllActiveLeaveTypes: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.LEAVE_TYPE_COLLECTION)
        .find({ status: { $ne: false } })
        .toArray()
        .then((result) => {
          resolve(result);
        });
    });
  },
  createHoliday: (data) => {
    // data.holidaydate = new Date(data.holidaydate);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.HOLIDAY_COLLECTION)
        .findOne({
          holidaydate: data.holidaydate,
        })
        .then((found) => {
          if (!found) {
            db.get()
              .collection(collections.HOLIDAY_COLLECTION)
              .insertOne(data)
              .then(() => {
                resolve();
              });
          } else {
            reject("Date already exist!!");
          }
        });
    });
  },
  getAllHolidays: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.HOLIDAY_COLLECTION)
        .find()
        .toArray()
        .then((result) => {
          resolve(result);
        });
    });
  },
  getHolidayData: (holidayId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.HOLIDAY_COLLECTION)
        .findOne({
          _id: ObjectId(holidayId),
        })
        .then((result) => {
          resolve(result);
        });
    });
  },
  modifyHoliday: (holidayId, holidayData) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.HOLIDAY_COLLECTION)
        .findOne({
          holidaydate: holidayData.holidaydate,
        })
        .then((found) => {
          if (!found) {
            db.get()
              .collection(collections.HOLIDAY_COLLECTION)
              .updateOne(
                {
                  _id: ObjectId(holidayId),
                },
                {
                  $set: holidayData,
                }
              )
              .then(() => {
                resolve({ status: true });
              });
          } else {
            resolve({ status: false, msg: "Date already exist!!" });
          }
        });
    });
  },
  removeHoliday: (holidayId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.HOLIDAY_COLLECTION)
        .remove({
          _id: ObjectId(holidayId),
        })
        .then(() => {
          resolve();
        });
    });
  },
  doAttendance: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .aggregate([
          {
            $match: {
              activestatus: {
                $ne: false,
              },
            },
          },
          {
            $lookup: {
              from: "designations",
              localField: "designation",
              foreignField: "_id",
              as: "desi",
            },
          },
          {
            $unwind: "$desi",
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "dept",
            },
          },
          {
            $unwind: "$dept",
          },
          {
            $project: {
              employeeid: 1,
              firstname: 1,
              lastname: 1,
              department: "$dept.department",
              designation: "$desi.designation",
              activestatus: 1,
            },
          },
        ])
        .toArray()
        .then((result) => {
          resolve(result);
        });
    });
  },
  getEmployeeDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      // let dutyData = await db.get().collection(collections.DUTY_SHIFT_COLLECTION).find().toArray()
      // console.log("dddddd",dutyData)
      db.get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((data) => {
          // dutyData.forEach(element => {
          //     dutyData.dutyId = element._id
          //     dutyData.dutyName = element.dutyName
          // });

          resolve(data);
        });
    });
  },
  setEmployeeAttendance: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ATTENDANCE_COLLECTION)
        .insertOne(data)
        .then((data) => {
          resolve(data);
        });
    });
  },
  setOvertime: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .find()
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },
  setDutyShift: (data) => {
    return new Promise(async (resolve, reject) => {
      data.date = new Date(data.date);
      db.get()
        .collection(collections.DUTY_SHIFT_COLLECTION)
        .insertOne(data)
        .then(async (data) => {
          resolve(data);
        });
    });
  },
  getDutyShiftData: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collections.DUTY_SHIFT_COLLECTION)
        .find()
        .toArray();
      // console.log("xdasd", data)
      resolve(data);
    });
  },
  deleteSift: (dataId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DUTY_SHIFT_COLLECTION)
        .deleteOne({ _id: ObjectId(dataId) })
        .then((data) => {
          // console.log(data)
          resolve(data);
        });
    });
  },
  getAllEmployeesData: () => {
    console.log("next success");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .find({ user: "employee", activestatus: true })
        .toArray()
        .then((data) => {
          // console.log('data', data)
          resolve(data);
        });
    });
  },
  setTodayAttendance: (datain, id, datein) => {
    console.log("datain>>>>>", datain);
    return new Promise(async (resolve, reject) => {
      // let date = new Date()
      let date = new Date(datain.date);
      let thisYear = date.getFullYear();
      let thisMonth = date.getMonth() + 1;
      let thisDay = date.getDate();

      datain.employeeId = ObjectId(id);
      datain.date = new Date(datain.date);

      let response = {};

      let employeeData = await db
        .get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .find({ user: "employee", activestatus: true })
        .toArray();
      let datas = await db
        .get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 1,
              employeeId: 1,
              name: 1,
              date: 1,
              year: { $year: "$date" },
              month: { $month: "$date" },
              day: { $dayOfMonth: "$date" },
            },
          },
          {
            $match: {
              employeeId: ObjectId(id),
              year: thisYear,
              month: thisMonth,
              day: thisDay,
            },
          },
          {
            $project: {
              _id: 1,
              employeeId: 1,
              name: 1,
              date: 1,
            },
          },
        ])
        .toArray();

      // console.log("data updated id>>>>>>", datas)
      if (datas.length !== 0) {
        // console.log("existed>>>>>")
        employeeData.datas = datas;
        array = employeeData.datas;
        array.forEach((element) => {
          element.message = "already entered";
        });
        console.log("employee data>>>>", employeeData);
        resolve(employeeData);
      }
      else {
        console.log("inserted attendance>>>>", datain);
        let stime = datain.startTime;
        let etime = datain.endTime;
        // console.log(parseFloat(time));
        // console.log(time.split(":"));
        let splitStart = stime.split(":");
        let splitEnd = etime.split(":");
        let sarr = [];
        let earr = []
        splitStart.map((time) => {
          console.log(parseFloat(time));
          let partime = parseFloat(time);
          sarr.push(partime);
        });
        splitEnd.map((times) => {
            console.log(parseFloat(times));
            let partimes = parseFloat(times);
            earr.push(partimes);
          });
        console.log("sarr>>>>",sarr);
        console.log("earr>>>>",earr);
        if (sarr[0] >= 8 && sarr[1] > 15 && earr[0] <= 17 && earr[1] < 55) {
            datain.dutyStatus = "half-day"
            console.log("greater than 9");
            db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).insertOne(datain).then((data) => {
                employeeData.datas = datas;
                array = employeeData.datas;
                // array.forEach((element)=>{
                //     element.message = "successfully entered"
                // })
                console.log("data entered", data);
                array.push({ name: datain.name, message: "successfully entered" });
                // employeeData.datas = {message:"successfully entered"}
                // console.log("employee data>>>>", employeeData)
                // console.log("data entered")
                resolve(employeeData);
              });
        }
        else if(sarr[0] <= 8 && sarr[1] < 15 && earr[0] <= 17 && earr[1] < 55 ){
            datain.dutyStatus = "half-day"
            console.log("less than 9");
            db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).insertOne(datain).then((data) => {
                employeeData.datas = datas;
                array = employeeData.datas;
                // array.forEach((element)=>{
                //     element.message = "successfully entered"
                // })
                console.log("data entered", data);
                array.push({ name: datain.name, message: "successfully entered" });
                // employeeData.datas = {message:"successfully entered"}
                // console.log("employee data>>>>", employeeData)
                // console.log("data entered")
                resolve(employeeData);
          });
        }
        // else if(sarr[0] <= 8 && sarr[1] < 15 && earr[0] <= 17 && earr[1] > 55 ){
        //     datain.dutyStatus = "full-day"
        //     console.log("less than 9");
        //     db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).insertOne(datain).then((data) => {
        //         employeeData.datas = datas;
        //         array = employeeData.datas;
        //         // array.forEach((element)=>{
        //         //     element.message = "successfully entered"
        //         // })
        //         console.log("data entered", data);
        //         array.push({ name: datain.name, message: "successfully entered" });
        //         // employeeData.datas = {message:"successfully entered"}
        //         // console.log("employee data>>>>", employeeData)
        //         // console.log("data entered")
        //         resolve(employeeData);
        //   });
        // }
         else {
            datain.dutyStatus = "full-day"
            console.log("stable");
            db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).insertOne(datain).then((data) => {
                employeeData.datas = datas;
                array = employeeData.datas;
                // array.forEach((element)=>{
                //     element.message = "successfully entered"
                // })
                console.log("data entered", data);
                array.push({ name: datain.name, message: "successfully entered" });
                // employeeData.datas = {message:"successfully entered"}
                // console.log("employee data>>>>", employeeData)
                // console.log("data entered")
                resolve(employeeData);
          });
        }
        // console.log("not existed>>>>")
        // data.active = true
        
      }
    });
  },
  viewEmployeeAttendance: () => {
    return new Promise(async (resolve, reject) => {
      // let data = []
      db.get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .find({ user: "employee", activestatus: true })
        .toArray()
        .then((data) => {
          resolve(data);
        });
      // db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).aggregate([
      //     {$match : {attendanceStatus:"duty"}},
      //     {$group : {_id : _id}}
      // ]).then((data)=>{
      //     console.log('data>>>>',data)
      // })
    });
  },
  // viewEmployeeAttendanceDetails : (id)=>{
  //     console.log("id>>>>",id)
  //     return new Promise(async (resolve,reject)=>{
  //         let employee = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({_id:ObjectId(id)})

  //         let data = await db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).find({employeeId:ObjectId(id),attendanceStatus:"duty"}).count()

  //         let employeeData = {
  //             employeeFirstName : employee.firstname,
  //             employeeLastName : employee.lastname,
  //             email : employee.email,
  //             attendance : data
  //         }
  //         console.log("dddd",employeeData)
  //         resolve(employeeData)
  //     })
  // },
  viewEmployeeAttendanceDetails: (id) => {
    // console.log("id>>>>", id)
    let date = new Date();
    let thisYear = date.getFullYear();
    thisMonth = date.getMonth() + 1;
    // console.log("year>>>>>>", thisYear)
    // console.log("month>>>>>>", thisMonth)
    return new Promise(async (resolve, reject) => {
      let employee = await db
        .get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .findOne({ _id: ObjectId(id) });

      let data = await db
        .get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 1,
              employeeId: 1,
              date: 1,
              attendanceStatus: 1,
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
          },
          {
            $match: {
              employeeId: ObjectId(id),
              attendanceStatus: "duty",
              year: thisYear,
              month: thisMonth,
            },
          },
          {
            $project: {
              id: 1,
              date: 1,
              attendanceStatus: 1,
            },
          },
          {
            $count: "attendance",
          },
        ])
        .toArray();
      // console.log("new date data>>>>", data)
      let employeeData = {
        employeeId: employee._id,
        employeeFirstName: employee.firstname,
        employeeLastName: employee.lastname,
        email: employee.email,
        attendance: data,
      };
      // console.log("dddd", employeeData)
      resolve(employeeData);
    });
  },
  getMonthwiseAttendanceDetails: (id, targetmonth) => {
    // console.log("new id", id)
    let newmonth = parseInt(targetmonth);
    let thisYear = new Date();
    let nowYear = thisYear.getFullYear();
    // console.log("this year>>>>", nowYear)
    // console.log("this month", targetmonth)
    return new Promise(async (resolve, reject) => {
      let employee = await db
        .get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      let data = await db
        .get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 1,
              employeeId: 1,
              date: 1,
              attendanceStatus: 1,
              
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
          },
          {
            $match: {
              employeeId: ObjectId(id),
              attendanceStatus: "duty",
              year: nowYear,
              month: newmonth,
            },
          },
          {
            $project: {
              id: 1,
              date: 1,
              attendanceStatus: 1,
              
            },
          },
          {
            $count: "attendance",
          },
        ])
        .toArray();
      // let leaveData = await db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).aggregate([
      //     {
      //         $project: {
      //             _id: 1,
      //             employeeId: 1,
      //             date: 1,
      //             attendanceStatus: 1,
      //             year: { $year: '$date' },
      //             month: { $month: '$date' }
      //         }
      //     },
      //     {
      //         $match: {
      //             employeeId: ObjectId(id),
      //             attendanceStatus: "leave",
      //             year: nowYear,
      //             month: 10
      //         }
      //     },
      //     {
      //         $project: {
      //             id: 1,
      //             date: 1,
      //             attendanceStatus: 1
      //         }
      //     },
      //     {
      //         $count: "attendance"
      //     }
      // ]).toArray()
      let monthData = await db
        .get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 1,
              employeeId: 1,
              date: 1,
              attendanceStatus: 1,
              year: { $year: "$date" },
              month: { $month: "$date" },
              // month : { $toInt: targetmonth }
            },
          },
          {
            $match: {
              employeeId: ObjectId(id),
              attendanceStatus: "duty",
              year: nowYear,
              month: newmonth,
            },
          },
          {
            $project: {
              id: 1,
              date: 1,
              attendanceStatus: 1,
            },
          },
          {
            $count: "month",
          },
        ])
        .toArray();
      let attendanceData = await db
        .get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $project: {
              _id: 1,
              employeeId: 1,
              date: 1,
              attendanceStatus: 1,
              dutyStatus: 1,
              startTime: 1,
              endTime: 1,
              year: { $year: "$date" },
              month: { $month: "$date" },
              // month : { $toInt: targetmonth }
            },
          },
          {
            $match: {
              employeeId: ObjectId(id),
              // attendanceStatus: "duty",
              year: nowYear,
              month: newmonth,
            },
          },
          {
            $project: {
              id: 1,
              date: 1,
              attendanceStatus: 1,
              dutyStatus: 1,
              startTime: 1,
              endTime: 1,
            },
          },
        ])
        .toArray();
      // console.log("neeeeeeew", attendanceData)
      let employeeData = {
        employeeId: employee._id,
        employeeFirstName: employee.firstname,
        employeeLastName: employee.lastname,
        email: employee.email,
        attendance: data,
        // leave: leaveData,
        monthAttendance: monthData,
        attendanceData: attendanceData,
      };
      // console.log("fffffff", employeeData)
      resolve(employeeData);
    });
  },
  getTodayAttendance: () => {
    // console.log("net success")
    var start = new Date();
    let end = new Date(
      start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate()
    );

    // console.log("start date", start)
    // console.log("end date", end)

    // var start = new Date();
    // start.setHours(0, 0, 0, 0);

    // var end = new Date();
    // end.setHours(23, 59, 59, 999);
    return new Promise((resolve, reject) => {
      // db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).find({date: {$gte: start, $lt: end}}).toArray().then((data) => {
      //     console.log("ffffff", data)
      //     resolve(data)
      // })
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: {
              date: {
                $gte: new Date(end),
                $lt: new Date(start),
              },
              // 'activestatus' :{
              //     $ne : false
              // }
            },
          },
        ])
        .toArray()
        .then((data) => {
          console.log("data>>>>", data);
          resolve(data);
        });
    });
  },
  getEmployeeSalary: () => {
    return new Promise((resolve, reject) => {
      let date = new Date();
      let thisYear = date.getFullYear();
      let thisMonth = date.getMonth() + 1;
      // console.log("year>>>", thisYear)
      // console.log("month>>>>", thisMonth)
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          // {
          //     $project: {
          //         _id: 1,
          //         name: 1,
          //         date: 1,
          //         year: { $year: "$date" },
          //         month: { $month: "$date" },
          //         attendanceStatus: 1,
          //         basicSalary: "$salary.basicsalary",
          //         employeeId: 1

          //     }
          // },
          // {
          //     $match: {
          //         year: thisYear,
          //         month: thisMonth,
          //         attendanceStatus: "duty"
          //     }
          // },

          // {

          //     $group: {
          //         _id: "$employeeId",
          //         name: { $first: "$name" },

          //         total: { $sum: 1 },
          //         basicSalary: { $first : "$basicSalary"}
          //     }

          // },

          {
            $lookup: {
              from: "employees",
              localField: "employeeId",
              foreignField: "_id",
              as: "salary",
            },
          },
          {
            $unwind: {
              path: "$salary",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              date: 1,
              year: {
                $year: "$date",
              },
              month: {
                $month: "$date",
              },
              attendanceStatus: 1,
              employeeId: 1,
              basicSalary: "$salary.basicsalary",
            },
          },
          {
            $match: {
              year: thisYear,
              month: thisMonth,
              attendanceStatus: "duty",
            },
          },
          {
            $group: {
              _id: "$employeeId",
              name: {
                $first: "$name",
              },
              total: {
                $sum: 1,
              },
              basicSalary: {
                $first: "$basicSalary",
              },
            },
          },
        ])
        .toArray()
        .then(async (data) => {
          // let halfDay = await db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).aggregate([
          //   {
          //     $lookup: {
          //       from: "employees",
          //       localField: "employeeId",
          //       foreignField: "_id",
          //       as: "salary",
          //     },
          //   },
          //   {
          //     $unwind: {
          //       path: "$salary",
          //     },
          //   },
          //   {
          //     $project: {
          //       _id: 1,
          //       name: 1,
          //       date: 1,
          //       year: {
          //         $year: "$date",
          //       },
          //       month: {
          //         $month: "$date",
          //       },
          //       attendanceStatus: 1,
          //       dutyStatus: 1,
          //       employeeId: 1,
          //       basicSalary: "$salary.basicsalary",
          //     },
          //   },
          //   {
          //     $match: {
          //       year: thisYear,
          //       month: thisMonth,
          //       dutyStatus: "half-day",
          //     },
          //   },
          //   {
          //     $group: {
          //       _id: "$employeeId",
          //       name: {
          //         $first: "$name",
          //       },
          //       totalHalfDayDuty: {
          //         $sum: 1,
          //       },
          //       basicSalary: {
          //         $first: "$basicSalary",
          //       },
          //     },
          //   },
          // ]).toArray()
          console.log("attendance data>>>>", data)
          // console.log("half day data>>>>", halfDay)
          resolve(data);
        });
    });
  },
  getEditingAttendance: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  updateEmployeeAttendance: (data, id) => {
    // console.log("data successfully endered")

    return new Promise((resolve, reject) => {
      data.date = new Date(data.date);
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              name: data.name,
              date: data.date,
              attendanceStatus: data.attendanceStatus,
              startTime: data.startTime,
              endTime: data.endTime,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },
  pdfGenerator: () => {
    return new Promise((resolve, reject) => {
      let date = new Date();
      let thisYear = date.getFullYear();
      let thisMonth = date.getMonth() + 1;
      // console.log("year>>>", thisYear)
      // console.log("month>>>>", thisMonth)
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $lookup: {
              from: "employees",
              localField: "employeeId",
              foreignField: "_id",
              as: "salary",
            },
          },
          {
            $unwind: {
              path: "$salary",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              date: 1,
              year: {
                $year: "$date",
              },
              month: {
                $month: "$date",
              },
              attendanceStatus: 1,
              employeeId: 1,
              basicSalary: "$salary.basicsalary",
            },
          },
          {
            $match: {
              year: thisYear,
              month: thisMonth,
              attendanceStatus: "duty",
            },
          },
          {
            $group: {
              _id: "$employeeId",
              name: {
                $first: "$name",
              },
              total: {
                $sum: 1,
              },
              basicSalary: {
                $first: "$basicSalary",
              },
            },
          },
        ])
        .toArray()
        .then((data) => {
          // console.log("data>>>>", data)
          resolve(data);
        });
    });
  },

  excelGenerator: () => {
    return new Promise((resolve, reject) => {
      let date = new Date();
      let thisYear = date.getFullYear();
      let thisMonth = date.getMonth() + 1;
      // console.log("year>>>", thisYear)
      // console.log("month>>>>", thisMonth)
      db.get()
        .collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $lookup: {
              from: "employees",
              localField: "employeeId",
              foreignField: "_id",
              as: "salary",
            },
          },
          {
            $unwind: {
              path: "$salary",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              date: 1,
              year: {
                $year: "$date",
              },
              month: {
                $month: "$date",
              },
              attendanceStatus: 1,
              employeeId: 1,
              basicSalary: "$salary.basicsalary",
            },
          },
          {
            $match: {
              year: thisYear,
              month: thisMonth,
              attendanceStatus: "duty",
            },
          },
          {
            $group: {
              _id: "$employeeId",
              name: {
                $first: "$name",
              },
              total: {
                $sum: 1,
              },
              basicSalary: {
                $first: "$basicSalary",
              },
            },
          },
        ])
        .toArray()
        .then((data) => {
          // console.log("data>>>>", data)
          resolve(data);
        });
    });
  },

  getLeaveReport: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_LEAVE_COLLECTIONS)
        .find({ status: 1 })
        .toArray()
        .then((data) => {
          // console.log("leave reports>>>>",data)
          resolve(data);
        });
    });
  },

  doLeaveApproval: (id, empid) => {
    return new Promise(async (resolve, reject) => {
      let email = await db
        .get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .findOne({ _id: ObjectId(empid) });

      let data = await db
        .get()
        .collection(collections.EMPLOYEE_LEAVE_COLLECTIONS)
        .updateOne(
          { _id: ObjectId(id) },
          { $set: { status: 0, approvalStatus: true } }
        );
      // console.log("updated data>>>>",data)
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bipinalex2014@gmail.com",
          pass: "totalvirus123",
        },
      });
      const mailOptions = {
        from: "bipinalex2014@gmail.com", // sender address
        to: email.email, // list of receivers
        subject: "Leave Approval Mail", // Subject line
        html: "<h1>your leave request is approved</h1>", // plain text body
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
        resolve(info);
      });
    }).then((data) => {
      resolve(data);
    });
  },

  doLeaveRejected: (id, empid) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collections.EMPLOYEE_LEAVE_COLLECTIONS)
        .updateOne(
          { _id: ObjectId(id) },
          { $set: { status: 0, approvalStatus: false } }
        );
      let email = await db
        .get()
        .collection(collections.EMPLOYEE_COLLECTION)
        .findOne({ _id: ObjectId(empid) });
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bipinalex2014@gmail.com",
          pass: "totalvirus123",
        },
      });
      const mailOptions = {
        from: "bipinalex2014@gmail.com", // sender address
        to: email.email, // list of receivers
        subject: "Leave Rejection Mail", // Subject line
        html: "<h1>your leave request is rejected</h1>", // plain text body
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
        resolve(info);
      });
    }).then((data) => {
      resolve(data);
    });
  },

  getEmployeesLeaveApprovalDetails: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_LEAVE_COLLECTIONS)
        .find({ status: 0, approvalStatus: true })
        .toArray()
        .then((data) => {
          // console.log("employees leave approval data",data)
          resolve(data);
        });
    });
  },

  getEmployeesLeaveRejectionDetails: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.EMPLOYEE_LEAVE_COLLECTIONS)
        .find({ status: 0, approvalStatus: false })
        .toArray()
        .then((data) => {
          // console.log("employees leave rejection data",data)
          resolve(data);
        });
    });
  },
};
