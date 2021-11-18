const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');

module.exports = {
    setSignupData : (signupdata)=>{
        return new Promise(async (resolve,reject)=>{
            signupdata.user = 'admin'
            signupdata.password = await bcrypt.hash(signupdata.password, 10);
            db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(signupdata).then((data)=>{
                resolve(data)
            })
        })
    },
    setLoginData: (logindata) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let email = await db.get().collection(collections.ADMIN_COLLECTIONS).findOne({ email: logindata.email })
            console.log("datas>>>", email)
            if (email) {
                bcrypt.compare(logindata.password, email.password).then((status_value) => {
                    if (status_value) {
                        // response.admin=db_data
                        response.status = true
                        resolve(response)
                        console.log("response>>>>", response)
                    }
                    else {
                        resolve(response.status = false)
                    }

                })
            }
            else {
                console.log("login failed")
                resolve(response.status = false)

            }
        })
    },
    getActiveDepartments: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DEPARTMENT_COLLECTION).find({
                active: {
                    $ne: false
                }
            }).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    getActiveDesignations: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DESIGNATION_COLLECTION).find({
                active: {
                    $ne: false
                }
            }).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    createEmployee: (empData) => {

        return new Promise(async (resolve, reject) => {
            empData.department = objectId(empData.department);
            empData.designation = objectId(empData.designation);
            empData.headdesignation = objectId(empData.headdesignation);
            empData.basicsalary = parseFloat(empData.basicsalary);
            empData.otrate = parseFloat(empData.otrate);
            empData.dateofbirth = new Date(empData.dateofbirth);
            empData.dateofjoin = new Date(empData.dateofjoin);
            empData.password = await bcrypt.hash(empData.password, 10);
            empData.activestatus = true;
            empData.user = 'employee'
            delete empData.confirmpassword;
            console.log("emp data>>>>",empData)
            db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(empData).then((result) => {
                resolve(result);
            })
        })
    },
    getAllEmployees: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate(

                [
                    {
                        '$match': {
                            'activestatus': {
                                '$ne': false
                            },
                            'user': 'employee'
                        }
                    }, {
                        '$lookup': {
                            'from': 'designations',
                            'localField': 'designation',
                            'foreignField': '_id',
                            'as': 'desi'
                        }
                    }, {
                        '$unwind': '$desi'
                    }, {
                        '$lookup': {
                            'from': 'departments',
                            'localField': 'department',
                            'foreignField': '_id',
                            'as': 'dept'
                        }
                    }, {
                        '$unwind': '$dept'
                    }, {
                        '$project': {
                            'employeeid': 1,
                            'firstname': 1,
                            'lastname': 1,
                            'department': '$dept.department',
                            'designation': '$desi.designation',
                            'activestatus': 1,
                        }
                    }
                ]
            ).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    getEmployeeDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            '_id': objectId(id),
                        }
                    }, {
                        '$lookup': {
                            'from': collections.DEPARTMENT_COLLECTION,
                            'localField': 'department',
                            'foreignField': '_id',
                            'as': 'dept'
                        }
                    }, {
                        '$unwind': '$dept'
                    }, {
                        '$lookup': {
                            'from': collections.DESIGNATION_COLLECTION,
                            'localField': 'designation',
                            'foreignField': '_id',
                            'as': 'desi'
                        }
                    }, {
                        '$unwind': '$desi'
                    }, {
                        '$project': {
                            'firstname': 1,
                            'lastname': 1,
                            'employeeid': 1,
                            'gender': 1,
                            'department': '$dept.department',
                            'designation': '$desi.designation',
                            'email': 1,
                            'phone': 1,
                            'bloodgroup': 1,
                            'photopath': 1,

                        }
                    }
                ]
            ).toArray().then((result) => {
                resolve(result[0]);
            })
        })
    },
    getEmployeeQualifications: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }, { qualifications: 1 }).then((result) => {
                if (result.qualifications) {
                    resolve(result.qualifications);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newQualification: (employee, qualification) => {
        qualification.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                qualifications: qualification
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    getEmployeeExperiences: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }, { qualifications: 1 }).then((result) => {
                if (result.experiences) {
                    resolve(result.experiences);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newExperience: (employee, experience) => {
        experience.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                experiences: experience
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    getEmployeeBankDetails: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }).then((result) => {
                if (result.bankdetails) {
                    resolve(result.bankdetails);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newAccountDetails: (employee, accountdetails) => {
        accountdetails.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                bankdetails: accountdetails
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    getEmergencyContacts: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }).then((result) => {
                if (result.emergencycontacts) {
                    resolve(result.emergencycontacts);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newEmergancyContact: (employee, contactdetails) => {
        contactdetails.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                emergencycontacts: contactdetails
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    getContracts: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }).then((result) => {
                if (result.contracts) {
                    resolve(result.contracts);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newContract: (employee, contractdetails) => {
        contractdetails.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                contracts: contractdetails
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    getImigrations: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(empId) }).then((result) => {
                if (result.imigrations) {
                    resolve(result.imigrations);
                }
                else {
                    resolve(null);
                }
            })
        })
    },
    newImigration: (employee, imigrationdetails) => {
        imigrationdetails.id = new ObjectId();
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(employee) }).then((result) => {
                if (result) {
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                        _id: objectId(employee)
                    },
                        {
                            $push: {
                                imigrations: imigrationdetails
                            }
                        }).then(() => {
                            resolve();
                        })
                }
            })
        })
    },
    updateAvatar: (empId, path) => {
        console.log(path)
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                _id: objectId(empId)
            }, {
                $set: {
                    photopath: path,
                }
            }).then(() => {
                resolve();
            })
        })
    },
    updateSocialMedia: (empId, socialmedia) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({
                _id: objectId(empId)
            }, {
                $set: {
                    socialmedia: socialmedia
                }
            }).then(() => {
                resolve();
            })
        })
    },
    getCompleteProfile: (empId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            '_id': objectId(empId),
                        }
                    }, {
                        '$lookup': {
                            'from': 'departments',
                            'localField': 'department',
                            'foreignField': '_id',
                            'as': 'dept'
                        }
                    }, {
                        '$unwind': '$dept'
                    }, {
                        '$lookup': {
                            'from': 'designations',
                            'localField': 'designation',
                            'foreignField': '_id',
                            'as': 'desi'
                        }
                    }, {
                        '$unwind': '$desi'
                    }, {
                        '$lookup': {
                            'from': 'designations',
                            'localField': 'headdesignation',
                            'foreignField': '_id',
                            'as': 'head'
                        }
                    }, {
                        '$unwind': '$head'
                    }
                ]
            ).toArray().then((result) => {
                resolve(result[0]);
            })
        })
    },
    getEmployee: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).find().toArray().then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getShiftDetails: () => {
        return new Promise(async (resolve, reject) => {
            // let data = await db.get().collection(collections.ATTENDANCE_COLLECTION).find({id:employeeId}).toArray()
            // resolve(data)
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).find().toArray().then((data) => {
                console.log("kkkkkkkk", data)

                resolve(data)
            })
        })
    },
    getShiftTime: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {
                console.log("data>>>>>", data)
                resolve(data)
            })
        })

    },
    setShiftTime: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({ _id: objectId(data.employeeId) },
                {
                    $set: {
                        dutyShift: objectId(data.shiftName)
                    }
                }
            ).then((data) => {
                resolve(data)
            })
        })
    },
    getEmployeeDetailsForSalarySlip: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate([
                {
                    $match: {
                        activestatus: {
                            $ne: false
                        },
                        user:"employee"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstname: 1,
                        lastname: 1,
                        employeeid: 1,
                        email: 1,
                        department: 1,
                        designation: 1,
                    }
                },
                {
                    $lookup: {
                        from: "designations",
                        localField: "designation",
                        foreignField: "_id",
                        as: "desi"
                    }
                },
                {
                    $unwind: "$desi"

                },
                {
                    $project: {
                        _id: 1,
                        firstname: 1,
                        lastname: 1,
                        employeeid: 1,
                        designation: "$desi.designation"
                    }
                },

            ]).toArray().then((data) => {
                console.log(data)
                resolve(data)
            })
            // db.get().collection(collections.EMPLOYEE_COLLECTION).find().toArray().then((data)=>{
            //     resolve(data)
            // })
        })
    },
    getEmployeeDetailsForSalarySlipForm: (id) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(id)

                    }
                },
                {
                    $lookup: {
                        from: 'designations',
                        localField: 'designation',
                        foreignField: '_id',
                        as: 'desi'
                    }
                },
                {
                    $unwind: '$desi'
                },
                {
                    $project: {
                        _id: 1,
                        firstname: 1,
                        lastname: 1,
                        employeeid: 1,
                        dateofjoin: 1,
                        department: 1,
                        designation: 1,
                        basicsalary: 1,
                        place: 1,
                        city: 1,
                        state: 1,
                        country: 1,
                        department: "$desi.designation",

                    }
                }
            ]).toArray().then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    setSalarySlipData: (data, id) => {
        data.empid = id
        data.salaryslipdate = new Date()
        data.basicSalary = parseFloat(data.basicSalary)
        data.convayanceAllowance = parseFloat(data.convayanceAllowance)
        data.leaveTravelAllowance = parseFloat(data.leaveTravelAllowance)
        data.houseRentAllowance = parseFloat(data.houseRentAllowance)
        data.additionalhra = parseFloat(data.additionalhra)
        data.medicalAllowance = parseFloat(data.medicalAllowance)
        data.transportAllowance = parseFloat(data.transportAllowance)
        data.superAnnuationAllowance = parseFloat(data.superAnnuationAllowance)
        data.lunchAllowance = parseFloat(data.lunchAllowance)
        data.totalEarnings = parseFloat(data.totalEarnings)
        data.providentFund = parseFloat(data.providentFund)
        data.totalDeduction = parseFloat(data.totalDeduction)
        data.loanDeduction = parseFloat(data.loanDeduction)
        return new Promise(async (resolve, reject) => {
            let date = new Date()
            let month = date.getMonth() + 1
            let year = date.getFullYear()
            let datas = await db.get().collection(collections.SALARY_SLIP_COLLECTION).findOne(
                {
                    empid: id,
                    "$expr": {
                        "$and": [
                            { "$eq": [{ "$month": "$salaryslipdate" }, month] },
                            { "$eq": [{ "$year": "$salaryslipdate" }, year] }
                        ]
                    }
                })
            if (datas) {
                resolve(datas = true)
            }
            else {
                console.log("employee id", datas)
                db.get().collection(collections.SALARY_SLIP_COLLECTION).insertOne(data).then((data) => {
                    resolve(data = false)
                })
            }

        })
    },
    getSalarySlipDetails: (id) => {
        console.log("id", id)
        let date = new Date()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        console.log("month>>>>", month)
        return new Promise(async (resolve, reject) => {
            let attendance = await db.get().collection(collections.EMPLOYEE_ATTENDANCE_COLLECTION).find(
                {
                    employeeId: objectId(id),
                    "$expr": {
                        "$and": [
                            { "$eq": [{ "$month": "$date" }, month] },
                            { "$eq": [{ "$year": "$date" }, year] }
                        ]
                    }
                }).count()

            console.log("attendance>>>>", attendance)
            let data = await db.get().collection(collections.SALARY_SLIP_COLLECTION).findOne(
                {
                    empid: id,
                    "$expr": {
                        "$and": [
                            { "$eq": [{ "$month": "$salaryslipdate" }, month] },
                            { "$eq": [{ "$year": "$salaryslipdate" }, year] }
                        ]
                    }
                }

            )
            data.attendance = attendance
            console.log("data>>>>>>", data)
            resolve(data)
        })
    }
}
