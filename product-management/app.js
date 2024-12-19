const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

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

// An admin user can create many products
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

// A user can have only one cart
User.hasOne(Cart);
Cart.belongsTo(User);

// A cart can have many products and a product can be in many carts
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

// An order belongs to a user and a user can have many orders
Order.belongsTo(User);
User.hasMany(Order);

// An order can have many products and a product can be in many orders
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});

// Create tables based on models
sequelize
  .sync()
  .then(result => {
    // create a dummy user
    return User.findByPk(1)
  })
  .then(user => {
    if (!user) {
      return User.create({name: 'Kelvin', email: 'test@example.com'});
    }
    return Promise.resolve(user);
  })
  .then(user => {
    user.getCart().then(cart => {
      if (!cart) {
        return user.createCart();
      }
      return cart;
    });
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
