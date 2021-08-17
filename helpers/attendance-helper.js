const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const { ObjectId } = require('mongodb');



module.exports = {



    getLeaveTypes: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LEAVE_TYPE_COLLECTION).find().toArray().then((result) => {
                resolve(result);
            })
        })
    },

    createLeaveType: (values) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LEAVE_TYPE_COLLECTION).insertOne(values).then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        })
    },
    getAllActiveLeaveTypes: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.LEAVE_TYPE_COLLECTION).find({ status: { $ne: false } })
                .toArray()
                .then((result) => {
                    resolve(result);
                })
        })
    },
    createHoliday: (data) => {
        // data.holidaydate = new Date(data.holidaydate);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOLIDAY_COLLECTION).findOne({
                holidaydate: data.holidaydate
            }).then((found) => {
                if (!found) {
                    db.get().collection(collections.HOLIDAY_COLLECTION).insertOne(data).then(() => {
                        resolve();
                    })
                }
                else {
                    reject('Date already exist!!');
                }
            })
        })
    },
    getAllHolidays: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOLIDAY_COLLECTION).find().toArray().then((result) => {
                resolve(result);
            })
        })
    },
    getHolidayData: (holidayId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOLIDAY_COLLECTION).findOne({
                _id: ObjectId(holidayId),
            }).then((result) => {
                resolve(result);
            })
        })
    },
    modifyHoliday: (holidayId, holidayData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOLIDAY_COLLECTION).findOne({
                holidaydate: holidayData.holidaydate
            }).then((found) => {
                if (!found) {
                    db.get().collection(collections.HOLIDAY_COLLECTION).updateOne({
                        _id: ObjectId(holidayId)
                    }, {
                        $set: holidayData,
                    }).then(() => {
                        resolve({status:true});
                    })
                }
                else {
                    resolve({status:false, msg:'Date already exist!!'});
                }
            })
        })
    },
    removeHoliday:(holidayId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOLIDAY_COLLECTION).remove({
                _id:ObjectId(holidayId)
            }).then(()=>{
                resolve();
            })
        })
    }
}
