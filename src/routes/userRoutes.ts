import express from "express";
const router = express.Router();
import usersController, {
  authMiddleware,
} from "../controllers/usersController";

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
 *         - avatarUrl
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
 *         avatarUrl:
 *           type: string
 *           description: The url of the avatar of the user
 *         creationTime:
 *           type: date
 *           description: The creation time of the post
 *       example:
 *         _id: 245234t234234r234r23f4
 *         username: Omer
 *         email: Omer@gmail.com
 *         avatarUrl: /pulic/324t23t4t23t4t23t4t.png
 *         password: 324vt23r4tr234t245tbv45by
 *         creationTime: 2025-01-22T14:04:07.120Z
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
 *       - in: query
 *         name: min
 *         schema:
 *           type: string
 *         required: false
 *         description: The lowest date of user I have to get more farther users
 *       - in: query
 *         name: max
 *         schema:
 *           type: string
 *         required: false
 *         description: The highest date of user I have to get more recent users
 *     responses:
 *       200:
 *         description: A list of users
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
 *                     $ref: '#/components/schemas/User'
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
 * /users/{id}:
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
 *               avatarUrl:
 *                 type: string
 *                 description: The url of the avatar of the user
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
