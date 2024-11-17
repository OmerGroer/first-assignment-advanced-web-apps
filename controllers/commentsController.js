const commentModel = require('../models/commentsModel');

const createComment = async (req, res) => {
    try {
        const comment = await commentModel.create(req.body);

        return res.status(201).send(comment);
    } catch (error) {
        return res.status(400).send(error.message);
    }
};

const updateComment = async (req, res) => {
    const commentId = req.params.id;
    const commentBody = req.body;

    try {
        const filter = { _id: commentId };

        const comment = await commentModel.findOneAndUpdate(
            filter,
            commentBody,
            {
                new: true,
            }
        );

        if (comment) {
            res.status(201).send(comment);
        } else {
            res.status(404).send('Comment not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteComment = async (req, res) => {
    const commentId = req.params.id;

    try {
        const filter = { _id: commentId };

        const comment = await commentModel.deleteOne(filter);

        if (comment) {
            res.status(200).send(comment);
        } else {
            res.status(404).send('Comment not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const getAllComments = async (req, res) => {
    const sender = req.query.sender;

    try {
        const filter = {};
        if (sender) filter.sender = sender;

        const comments = await commentModel.find(filter);
        res.send(comments);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getAllComments
};
