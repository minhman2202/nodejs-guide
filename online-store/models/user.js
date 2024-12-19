const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  save() {
    return getDb().collection('users')
      .insertOne(this)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static findById(id) {
    return getDb().collection('users')
      .find({_id: new mongodb.ObjectId(id)})
      .next()
      .then(user => {
        console.log(user);
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;