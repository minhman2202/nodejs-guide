const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://kelvin:m33VFfqybmOYOP0J@cluster0.hkhdf.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
    .then(client => {
      console.log('Connected!');
      // client.db().collection('products').insertOne({title: 'A Book', price: 12.99})
      //   .then(result => {
      //     console.log(result);
      //   });
      _db = client.db();
      callback();

    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
