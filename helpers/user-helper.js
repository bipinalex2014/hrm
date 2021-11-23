const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
    doLogin : (logindata)=>{
        return new Promise(async (resolve,reject)=>{
            response={}
            
            let databaseEmail= await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({email:logindata.email})
            // console.log("database email>>>", databaseEmail)
            // console.log("login password",logindata.password)
            // console.log("login data",databaseEmail.fname)
            if(databaseEmail){
                bcrypt.compare(logindata.password,databaseEmail.password).then((status)=>{
                    if(status){
                        response.signupUserData=databaseEmail
                        response.status=true
                        response.id = databaseEmail._id

                        // console.log("latest response>>>>",response)
                        resolve(response)
                    }
                    else{
                        resolve({status:false})
                    }
                })
            }
            else {
                // console.log("login failed")
                resolve(response.status = false)

            }
            
        })
    },
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
        // console.log(desi)
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
}
