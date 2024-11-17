const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.post('/', commentsController.createComment);

router.put("/:id", commentsController.updateComment);

module.exports = router;
