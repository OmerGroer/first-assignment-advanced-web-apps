import express from "express";
const router = express.Router();
import commentsController from "../controllers/commentsController";
import { authMiddleware } from "../controllers/usersController";

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - _id
 *         - postId
 *         - sender
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         postId:
 *           type: string
 *           description: The id of the related post of the comment
 *         sender:
 *           $ref: '#/components/schemas/UserPost'
 *           description: The sender id of the comment
 *         creationTime:
 *           type: date
 *           description: The creation time of the post
 *       example:
 *         _id: 245234t234234r234r23f4
 *         content: My First comment
 *         postId: 2f5ft23r4tr234t3698bv4vf5
 *         creationTime: 2025-01-22T14:04:07.120Z
 *         sender:
 *           _id: 245234t234234r234r23f4
 *           username: Omer
 *           avatarUrl: /pulic/324t23t4t23t4t23t4t.png
 */
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments. If query params are added, it will filter base on the params.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         required: false
 *         description: The sender ID to filter by the comments
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: false
 *         description: The post ID to filter by the comments
 *       - in: query
 *         name: min
 *         schema:
 *           type: string
 *         required: false
 *         description: The lowest date of comment I have to get more farther comments
 *       - in: query
 *         name: max
 *         schema:
 *           type: string
 *         required: false
 *         description: The highest date of comment I have to get more recent comments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 min:
 *                   type: string
 *                   example: "2025-01-22T14:04:07.120Z"
 *                 max:
 *                   type: string
 *                   example: "2025-01-22T14:04:07.120Z"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get("/", commentsController.getAll);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a single comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.get("/:id", commentsController.getById);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *               postId:
 *                 type: string
 *                 description: The post ID of the comment
 *             example:
 *               content: My First comment
 *               postId: 2f5ft23r4tr234t3698bv4vf5
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: The new comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", commentsController.create);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Uppdate a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *             example:
 *               content: My First comment
 *     responses:
 *       201:
 *         description: The comment after the update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put("/:id", commentsController.update);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     description: Delete a single comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: The deleted comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", commentsController.delete);

export default router;
