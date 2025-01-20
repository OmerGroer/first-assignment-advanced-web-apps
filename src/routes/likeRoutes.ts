import express from "express";
const router = express.Router();
import { authMiddleware } from "../controllers/usersController";
import likesController from "../controllers/likesController";

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: The Likes API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - _id
 *         - postId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         postId:
 *           type: string
 *           description: The id of the related post of the comment
 *         userId:
 *           $ref: '#/components/schemas/UserPost'
 *           description: The user id of the comment
 *       example:
 *         _id: 245234t234234r234r23f4
 *         postId: 2f5ft23r4tr234t3698bv4vf5
 *         userId: 245234t234234r234r23f4
 */

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Create a new like
 *     description: Create a new like
 *     tags:
 *       - Likes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The id of the post to like
 *             example:
 *               postId: 60f4f1d4b6d2b20015f8e1e9
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: The new like
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", likesController.create);

/**
 * @swagger
 * /likes/{postId}:
 *   delete:
 *     summary: Delete a like by post ID
 *     description: Delete a single like by post ID
 *     tags:
 *       - Likes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the liked post
 *     responses:
 *       200:
 *         description: The deleted like
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       404:
 *         description: Like not found
 *       500:
 *         description: Server error
 */
router.delete("/:postId", likesController.delete);

export default router;
