const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

module.exports = {
    createDepartment: (deptName) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DEPARTMENT_COLLECTION).findOne({
                department: deptName,
                status: true
            }).then((found) => {
                if (found) {
                    reject()
                }
                else {
                    db.get().collection(collections.DEPARTMENT_COLLECTION).insertOne({
                        department: deptName
                    }).then(() => {
                        resolve(true)
                    }).catch(() => {
                        reject();
                    })
                }
            })
        })
    },
    getDepartments: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DEPARTMENT_COLLECTION).find().toArray().then((result) => {
                resolve(result);
            })
        })
    },
    getDesignations: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DESIGNATION_COLLECTION).find().toArray().then((result) => {
                resolve(result);
            })
        })
    },
    createDesignation: (desi) => {
        console.log(desi)
        desi.active = true;
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DESIGNATION_COLLECTION).findOne({
                designation: desi.designation
            }).then((found) => {
                if (found) {
                    reject()
                }
                else {
                    db.get().collection(collections.DESIGNATION_COLLECTION).insertOne(desi).then(() => {
                        resolve(true)
                    }).catch(() => {
                        reject();
                    })
                }
            })
        })
    },
    getActiveDepartments: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DEPARTMENT_COLLECTION).find({
                active: {
                    $ne: 'false'
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
                    $ne: 'false'
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
        delete empData.confirmpassword;
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(empData).then((result) => {
                resolve(result);
            })
        })
    },
    getAllEmployees: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.EMPLOYEE_COLLECTION).find().toArray().then((result) => {
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
                            'bloodgroup': 1
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
}