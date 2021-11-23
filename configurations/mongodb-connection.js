const mongoClient = require('mongodb').MongoClient;
let state = null;
module.exports.connect = (done) => {
    const url = 'mongodb://localhost:27017'
    // const url='mongodb+srv://user01:sPeAuc0ECtqfDMHz@kyfdatabase.t2h2n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    const dbname = 'redeemermanagement'
    mongoClient.connect(url,(err,data)=>{
        if(err) console.log('Error '+err)
        else
        {
            state=data.db(dbname);
            done();
        }
    })
}
module.exports.get=()=>{
    return state;
}