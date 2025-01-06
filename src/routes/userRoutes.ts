import express from "express";
const router = express.Router();
import usersController from "../controllers/usersController";
import authMiddleware from "../middlewares/authMiddleware";

router.use(authMiddleware);

/**
* @swagger
* tags:
*   name: Users
*   description: The Users API
*/
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - _id
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The encrypted password of the user
 *       example:
 *         _id: 245234t234234r234r23f4
 *         username: Omer
 *         email: Omer@gmail.com
 *         password: 324vt23r4tr234t245tbv45by
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users. If query params are added, it will filter base on the params.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: false
 *         description: The username to filter by the users
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: The email to filter by the users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get("/", usersController.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a single user by its ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", usersController.getById);

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update a user
 *     description: Uppdate a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       201:
 *         description: The user after the update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put("/:id", usersController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a single user by its ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: The deleted user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", usersController.delete);

export default router;