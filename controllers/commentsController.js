const commentModel = require('../models/commentsModel');

const createComment = async (req, res) => {
    try {
        const comment = await commentModel.create(req.body);

        return res.status(201).send(comment);
    } catch (error) {
        return res.status(400).send(error.message);
    }
};

module.exports = {
    createComment,
};
