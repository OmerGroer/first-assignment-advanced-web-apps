import express from "express";
const router = express.Router();
import postsController from "../controllers/postsController";
import { authMiddleware } from "../controllers/usersController";

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - content
 *         - restaurantId
 *         - rating
 *         - imageUrl
 *         - _id
 *         - sender
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         restaurant:
 *           $ref: '#/components/schemas/RestaurantPost'
 *           description: The restaurant id related to the post
 *         rating:
 *           type: number
 *           description: The rating of the restaurant
 *         sender:
 *           $ref: '#/components/schemas/UserPost'
 *           description: The sender id of the post
 *         imageUrl:
 *           type: string
 *           description: The url of the image of the post
 *         isLiked:
 *           type: boolean
 *           description: The post is liked by the user
 *       example:
 *         _id: 245234t234234r234r23f4
 *         content: This is the content of my first post.
 *         restaurant: 
 *           _id: 324vt23r4tr234t245tbv45by
 *           name: My Restaurant
 *         rating: 5
 *         imageUrl: /public/324t23t4t23t4t23t4t.png
 *         isLiked: true
 *         sender:
 *           _id: 245234t234234r234r23f4
 *           username: Omer
 *           avatarUrl: /pulic/324t23t4t23t4t23t4t.png
 *     UserPost:
 *       type: object
 *       required:
 *         - _id
 *         - username
 *         - avatarUrl
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         avatarUrl:
 *           type: string
 *           description: The url of the avatar of the user
 *       example:
 *         _id: 245234t234234r234r23f4
 *         username: Omer
 *         avatarUrl: /pulic/324t23t4t23t4t23t4t.png
 *     RestaurantPost:
 *       type: object
 *       required:
 *         - _id
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the restaurant
 *         name:
 *           type: string
 *           description: The name of the restaurant
 *       example:
 *         _id: 234t234t234t234t234t234t
 *         name: My Restaurant
 */
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts. If query params are added, it will filter base on the params.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         required: false
 *         description: The sender ID to filter by the posts
 *       - in: query
 *         name: restaurant
 *         schema:
 *           type: string
 *         required: false
 *         description: The restaurant ID to filter by the posts
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get("/", postsController.getAll);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", postsController.getById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                     description: The content of the post
 *                   restaurant:
 *                     type: string
 *                     description: The restaurant id related to the post
 *                   rating:
 *                     type: number
 *                     description: The rating of the restaurant
 *                   imageUrl:
 *                     type: string
 *                     description: The url of the image of the post
 *                 required:
 *                   - content
 *                   - restaurant
 *                   - rating
 *                   - imageUrl
 *               restaurant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the restaurant
 *                   category:
 *                     type: string
 *                     description: The category of the restaurant
 *                   address:
 *                     type: string
 *                     description: The address of the restaurant
 *                   priceTypes:
 *                     type: string
 *                     description: The price types of the restaurant
 *                 required:
 *                   - name
 *                   - address
 *                   - priceTypes
 *             example:
 *               post:
 *                 content: This is the content of my first post.
 *                 restaurant: 324vt23r4tr234t245tbv45by
 *                 rating: 5
 *                 imageUrl: /public/324t23t4t23t4t23t4t.png
 *               restaurant:
 *                 name: My Restaurant
 *                 category: Fast Food
 *                 address: 1234 Main St, City, State, 12345
 *                 priceTypes: $$ - $$$
 *             required:
 *               - post
 *               - restaurant
 *     responses:
 *       201:
 *         description: The new post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", postsController.create);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Uppdate a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the post
 *               rating:
 *                 type: number
 *                 description: The rating of the restaurant
 *               imageUrl:
 *                 type: string
 *                 description: The url of the image of the post
 *             example:
 *               content: This is the content of my first post.
 *               rating: 5
 *               imageUrl: /public/324t23t4t23t4t23t4t.png
 *     responses:
 *       201:
 *         description: The post after the update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put("/:id", postsController.update);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Delete a single post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: The deleted post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", postsController.delete);

export default router;
