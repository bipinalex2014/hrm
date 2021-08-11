const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
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
    getActiveDesignations:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DESIGNATION_COLLECTION).find({
                active: {
                    $ne: 'false'
                }
            }).toArray().then((result) => {
               resolve(result)
            })
        })
    }
}