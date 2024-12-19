const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1).then(user => {
    // set a dummy user to context of every coming request
    req.user = user;
    next();
  }).catch(err => {
    console.log(err);
  });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

// Define relationships between tables
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

// Create tables based on models
sequelize.sync()
  .then(result => {
    // create a dummy user
    User.findByPk(1).then(user => {
      if (!user) {
        return User.create({name: 'Kelvin', email: 'test@example.com'});
      }
      return Promise.resolve(user);
    }).then(user => {
      console.log(user);
      app.listen(3000);
    });
  }).catch(err => {
  console.log(err);
});
