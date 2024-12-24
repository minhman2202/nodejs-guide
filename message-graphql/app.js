const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {graphqlHTTP} = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');
const auth = require('./middleware/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// [MMN] middleware for authentication (check user's access token in the request header)
app.use(auth);

// [MMN] endpoint for uploading images
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }

  if (!req.file) {
    return res
      .status(200)
      .json({message: 'No file provided!'});
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({message: 'File stored.', filePath: req.file.path});
});

// [MMN] endpoint for all graphql requests
app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err) {
    if (!err.originalError) {
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    return {message: message, status: code, data: data};
  }
}));

// [MMN] global error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data});
});


mongoose.connect('mongodb+srv://kelvin:m33VFfqybmOYOP0J@cluster0.hkhdf.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0')
  .then(result => {
    console.log('Connected to MongoDB');
    app.listen(8080);
  }).catch(err => console.log(err));

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};