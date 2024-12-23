const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts - fetching all posts
router.get('/posts', feedController.getPosts);

// POST /feed/post - creating a post
router.post('/post', [ // [MMN] validate the input using validator middleware
  body('title')
    .trim()
    .isLength({min: 5}),
  body('content')
    .trim()
    .isLength({min: 5})
], feedController.createPost);

// GET /feed/post/:postId - fetching a single post
router.get('/post/:postId', feedController.getPost);

// PUT /feed/post/:postId - editing a post
router.put('/post/:postId', [
  body('title')
    .trim()
    .isLength({min: 5}),
  body('content')
    .trim()
    .isLength({min: 5})
], feedController.updatePost);

// DELETE /feed/post/:postId - deleting a post
router.delete('/post/:postId', feedController.deletePost);

module.exports = router;