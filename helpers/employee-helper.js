const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');

module.exports = {
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
        empData.department = objectId(empData.department);
        empData.designation = objectId(empData.designation);
        empData.headdesignation = objectId(empData.headdesignation);
        empData.basicsalary = parseFloat(empData.basicsalary);
        empData.otrate = parseFloat(empData.otrate);
        empData.dateofbirth = new Date(empData.dateofbirth);
        empData.dateofjoin = new Date(empData.dateofjoin);
        empData.password = bcrypt.hash(empData.password, 10);
        empData.activestatus = true;
        delete empData.confirmpassword;
        return new Promise((resolve, reject) => {
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
                            }
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
                            'activestatus':1,
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
    getEmployee : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.EMPLOYEE_COLLECTION).find().toArray().then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    getShiftDetails : ()=>{
        return new Promise(async (resolve,reject)=>{
            // let data = await db.get().collection(collections.ATTENDANCE_COLLECTION).find({id:employeeId}).toArray()
            // resolve(data)
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).find().toArray().then((data)=>{
                console.log("kkkkkkkk",data)
                
                resolve(data)
            })
        })
    },
    getShiftTime : (id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).findOne({_id:objectId(id)}).then((data)=>{
                console.log("data>>>>>",data)
                resolve(data)
            })
        })
        
    },
    setShiftTime : (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({_id:objectId(data.employeeId)},
            {
                $set: {
                    dutyShift: objectId(data.shiftName)
            }}
            ).then((data)=>{
                resolve(data)
            })
        })
    }
}
