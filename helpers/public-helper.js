const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId
const { resolve, reject } = require('promise');
const { Collection } = require('mongodb');
const { response } = require('express');




module.exports = {

    doLogin: (logindata) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let email = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ email: logindata.email })
            // console.log("datas>>>", email)
            if (email) {
                bcrypt.compare(logindata.password, email.password).then((status_value) => {
                    if (status_value) {
                        // response.admin=db_data
                        response.status = true
                        response.id = email._id

                        // response.data=logindata

                        resolve(response)
                        // console.log("response>>>>", response)
                    }
                    else {
                        resolve(response.status = false)
                    }

                })
            }
            else {
                // console.log("login failed")
                resolve(response.status = false)

            }
        })

    },

    getEmploye: (empid) => {
        // console.log("employee id>>>>", empid)
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTIONS).find().toArray()
            // console.log("admin>>>>", admin)
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empid) }).then(async (data) => {
                let designation = await db.get().collection(collections.DESIGNATION_COLLECTION).findOne({ _id: data.designation })

                // console.log("designation>>>>", designation)
                data.name = data.firstname +" "+ data.lastname
                delete data.firstname
                delete data.lastname
                data.designation = designation.designation
                admin.forEach((element) => {
                    // console.log("data element>>>", element)
                    data.submittedTo = element.fullname
                })

                // console.log("employee data>>>>", data)
                resolve(data)
            })
        })
    },
    setEmployeeLeaveData: (leavedata, empid) => {
        return new Promise(async (resolve, reject) => {
            leavedata.from = new Date(leavedata.from)
            leavedata.to = new Date(leavedata.to)
            date = new Date(leavedata.from)
            year = date.getFullYear()
            month = date.getMonth() + 1
            day = date.getDate()
            // console.log("date>>>>", date)
            // console.log("date>>>>", year)
            // console.log("date>>>>", month)
            // console.log("date>>>>", day)
            // console.log("modified leave date>>>>>", leavedata)
            let response = {}
            let leaveDate = await db.get().collection(collections.EMPLOYEE_LEAVE_COLLECTIONS).find({
                empid: empid,
                "$expr": {
                    "$and": [
                        { "$eq": [{ "$year": "$from" }, year] },
                        { "$eq": [{ "$month": "$from" }, month] },
                        { "$eq": [{ "$dayOfMonth": "$from" }, day] }

                    ]
                }

            }).toArray()
            // console.log("leave date >>>", leaveDate.length)
            if (leaveDate.length !== 0) {
                response.name = leavedata.name
                response.employeeid = leavedata.employeeid
                response.designation = leavedata.designation
                response.submittedTo = leavedata.submittedTo
                response.message = "Your leave report is already entered"
                response.status = true
                resolve(response)
            }
            else {
                leavedata.status = parseFloat(1)
                // leavedata.approvalStatus = true
                db.get().collection(collections.EMPLOYEE_LEAVE_COLLECTIONS).insertOne(leavedata).then((data) => {
                    response.name = leavedata.name
                    response.employeeid = leavedata.employeeid
                    response.designation = leavedata.designation
                    response.submittedTo = leavedata.submittedTo
                    response.message = "your leave report is successfully entered"
                    response.status = false
                    resolve(response)
                })

            }

        })
    },
    getEmployeeLeaveStatus : (empid)=>{
        console.log("sssssss")
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.EMPLOYEE_LEAVE_COLLECTIONS).find({empid:empid}).toArray().then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    }
}