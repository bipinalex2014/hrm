const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');

module.exports = {
    setSignupData: (signupdata) => {
        return new Promise(async (resolve, reject) => {
            // console.log("signup data>>>", signupdata)
            let email = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ email: signupdata.email, user: "admin" })
            if (email) {
                resolve(data = 'This email is already existed try another email')
            }
            else {
                signupdata.user = 'admin'
                signupdata.password = await bcrypt.hash(signupdata.password, 10);
                db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(signupdata).then((data) => {
                    resolve(data = "successfully created")
                })
            }

        })
    },

    setChangedPassword: (data)=>{
        return new Promise(async (resolve,reject)=>{
            let email = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({user:"employee",email:data.email})
            console.log("email>>>",email)
            if(email){
                let oldPassword = await bcrypt.compare(data.oldpassword,email.password)
                console.log("old>>>",oldPassword)
                if(oldPassword){
                    data.newpassword = await bcrypt.hash(data.newpassword,10)
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({email:email.email},
                        {
                            $set : {
                                password : data.newpassword
                            }
                        }    
                    ).then((data)=>{
                        let message = "New password is successfully updated"
                        resolve(message)
                    })
                }
                else{
                    let message = "old password is not matching"
                    resolve(message)
                }
            }
            else{
                let message = "Entered email is not matching"
                resolve(message)
            }
        })
    },
    setLoginData: (logindata) => {
    
        return new Promise(async (resolve, reject) => {
            let response = {}
            let email = await db.get().collection(collections.ADMIN_COLLECTIONS).findOne({ email: logindata.email })
            // console.log("datas>>>", email)
            if (email) {
                bcrypt.compare(logindata.password, email.password).then((status_value) => {
                    if (status_value) {
                        // response.admin=db_data
                        response.status = true
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

            let email = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ email: empData.email, user: "employee" })
            if (email) {
                resolve(data = 'This email is already existed try another email')
            }
            else {
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
                // console.log("emp data>>>>",empData)
                db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(empData).then((data) => {
                    resolve(data =  "Successfully created");
                })
            }

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
                console.log("employee data>>>",result)
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
            }).then((data) => {
                // console.log("updated>>>>",data)
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
                // console.log(data)
                resolve(data)
            })
        })
    },
    getShiftDetails: () => {
        return new Promise(async (resolve, reject) => {
            // let data = await db.get().collection(collections.ATTENDANCE_COLLECTION).find({id:employeeId}).toArray()
            // resolve(data)
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).find().toArray().then((data) => {
                // console.log("kkkkkkkk", data)

                resolve(data)
            })
        })
    },
    getShiftTime: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DUTY_SHIFT_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {
                // console.log("data>>>>>", data)
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
                        user: "employee"
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
                // console.log(data)
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
                // console.log(data)
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
        data.projectAllowance = parseFloat(data.projectAllowance)
        data.providentFund = parseFloat(data.providentFund)
        data.overtimeAllowance = parseFloat(data.overtimeAllowance)
        data.entertainmentAllowance = parseFloat(data.entertainmentAllowance)
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

                resolve(datas = "Salary slip of this month is already entered")
            }
            else {
                // console.log("employee id", datas)
                db.get().collection(collections.SALARY_SLIP_COLLECTION).insertOne(data).then((data) => {
                    resolve(data = "Salary slip of this month is created successfully")
                })
            }

        })
    },
    getSalarySlipDetails: (id) => {
        // console.log("id", id)
        let date = new Date()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        // console.log("month>>>>", month)
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

            // console.log("attendance>>>>", attendance)
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
            if (data === undefined) {
                resolve(data = "empty")
            }
            else {
                // console.log("data1>>>>>>", data)
                data.attendance = attendance
                // console.log("data2>>>>>>", data)
                resolve(data)
            }

        })
    },
    getAllEmployee : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate([
                {
                    $match : {
                        user : "employee"
                    }
                },
                {
                    $project : {
                        firstname : 1,
                        lastname : 1,
                        employeeid : 1,
                        department : 1,
                        designation : 1,
                        email : 1,
                        activestatus : 1
                    }
                },
                {
                    $lookup : {
                        from : 'designations',
                        localField : 'designation',
                        foreignField : '_id',
                        as : 'desig'
                    }
                },
                {
                    $unwind : '$desig'        
                },
                {
                    $project : {
                        firstname : 1,
                        lastname : 1,
                        employeeid : 1,
                        // department : 1,
                        designation : '$desig.designation',
                        email : 1,
                        activestatus : 1
                    }
                },
                    
                
            ]).toArray().then((data)=>{
               
                resolve(data)
            })
            
            
            
            
            // find({user:"employee"}).toArray().then((data)=>{
            //     resolve(data)
            // })
        })
    },
    setEmployeeState : (empid)=>{
        return new Promise(async (resolve,reject)=>{
            let empData = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({_id:objectId(empid)})
            // if(empData){
                
                if(empData.activestatus){
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({_id:objectId(empid)},{$set:{activestatus:false}}).then((data)=>{
                        
                        let status = "Disable"
                        resolve(status)
                    })
                }
                else{
                    db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({_id:objectId(empid)},{$set:{activestatus:true}}).then((data)=>{
                        console.log("update>>>>",data)
                        let status = "Enable"
                        resolve(status)
                    })
                }
            // }
        })
    },
    deleteEmployee : (empid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.EMPLOYEE_COLLECTION).deleteOne({_id:objectId(empid)}).then((data)=>{
                resolve(data)
            })
        })
    },
    editEmployee : (empid)=>{
        return new Promise(async (resolve,reject)=>{
            let designationData = await db.get().collection(collections.DESIGNATION_COLLECTION).find().toArray()
            let departmentData = await db.get().collection(collections.DEPARTMENT_COLLECTION).find().toArray()
            // console.log("department>>>>",departmentData)
            // console.log("designation>>>>",designationData)
            db.get().collection(collections.EMPLOYEE_COLLECTION).aggregate([
                {
                    $match : {
                        _id : objectId(empid),
                        user : "employee"
                    }
                },
                {
                    $lookup : {
                        from : "departments",
                        localField : "department",
                        foreignField : "_id",
                        as : "dept"
                    }
                },
                {
                    $unwind : "$dept"
                },
                {
                    $project : {
                        firstname : 1,
                        lastname : 1,
                        employeeid : 1,
                        dateofjoin :1,
                        gender : 1,
                        dateofbirth : 1,
                        department : "$dept.department",
                        departmentId : "$dept._id",
                        designation : 1,
                        basicsalary : 1,
                        otrate : 1,
                        address : 1,
                        place : 1,
                        city : 1,
                        state : 1,
                        province : 1,
                        country : 1,
                        phone : 1,
                        email : 1,
                        bloodgroup: 1,
                        maritialstatus : 1,
                        activestatus : 1
                    }
                },
                {
                    $lookup : {
                        from : "designations",
                        localField : "designation",
                        foreignField : "_id",
                        as : "desig"
                    }
                },
                {
                    $unwind : "$desig"
                },
                {
                    $project : {
                        firstname : 1,
                        lastname : 1,
                        employeeid : 1,
                        dateofjoin :1,
                        gender : 1,
                        dateofbirth : 1,
                        department : 1,
                        departmentId : 1,
                        designation : "$desig.designation",
                        designationId : "$desig._id",
                        basicsalary : 1,
                        otrate : 1,
                        address : 1,
                        place : 1,
                        city : 1,
                        state : 1,
                        province : 1,
                        country : 1,
                        phone : 1,
                        email : 1,
                        bloodgroup: 1,
                        maritialstatus : 1,
                        activestatus : 1
                    }
                },

            ]).toArray().then((data)=>{
                console.log("aggregate data",data)
                data.departmentData = departmentData
                data.designationData = designationData
                resolve(data)
            })
            // console.log("data>>>>",data)
        })
    },
    updateEmployee : (data,id)=>{
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({_id:objectId(id)},
            {$set:
                {
                    firstname : data.firstname,
                    lastname : data.lastname,
                    employeeid : data.employeeid,
                    // dateofjoin : new Date(data.dateofjoin),
                    gender : data.gender,
                    // dateofbirth : new Date(data.dateofbirth),
                    department : objectId(data.department),
                    designation : objectId(data.designation),
                    basicsalary : parseFloat(data.basicsalary),
                    otrate : parseFloat(data.otrate),
                    address : data.address,
                    place : data.place,
                    city : data.city,
                    state : data.state,
                    province : data.province,
                    country : data.country,
                    phone : data.phone,
                    email  : data.email,
                    bloodgroup : data.bloodgroup,
                    maritialstatus : data.maritialstatus

                }}).then((data)=>{
                    resolve(data)
                    console.log("updated data>>>",data)
                })
        })
    }

}

