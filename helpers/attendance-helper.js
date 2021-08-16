const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');



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
    }
}
