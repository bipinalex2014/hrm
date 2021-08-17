const Promise = require('promise');
const db = require('../configurations/mongodb-connection');
const collections = require('../configurations/collections');
const { ObjectId } = require('mongodb');

module.exports = {
    insertDocument: (collectionName, data) => {
        return new Promise((resolve, reject) => {
            db.get().collectionName(collectionName).insertOne(data).then((result) => {
                resolve(result);
            })
        })
    },
    updateDocument: (collectionName, id, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionName).updateOne({
                _id: ObjectId(id)
            }, {
                $set: data,
            }).then((result) => {
                resolve(result);
            })
        })
    },
    removeDocument: (collectionName, id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionName).remove({
                _id: ObjectId(id),
            }).then((result) => {
                resolve(result);
            })
        })
    },
    getDocument: (collectionName,docId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionName).findOne({
                _id: ObjectId(docId),
            }).then((result) => {
                resolve(result);
            })
        })
    },
}