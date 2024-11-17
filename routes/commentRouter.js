const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.post('/', commentsController.createComment);

router.put('/:id', commentsController.updateComment);

router.delete('/:id', commentsController.deleteComment);

router.get("/", commentsController.getAllComments);

module.exports = router;
