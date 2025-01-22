import express from "express";
const router = express.Router();
import { authMiddleware } from "../controllers/usersController";
import restaurantsController from "../controllers/restaurantsController";

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: The Restaurants API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       required:
 *         - _id
 *         - name
 *         - address
 *         - priceTypes
 *         - rating
 *         - ratingCount
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the restaurant
 *         name:
 *           type: string
 *           description: The name of the restaurant
 *         category:
 *           type: string
 *           description: The category of the restaurant
 *         address:
 *           type: string
 *           description: The address of the restaurant
 *         priceTypes:
 *           type: string
 *           description: The price types of the restaurant
 *         rating:
 *           type: number
 *           description: The rating of the restaurant
 *         ratingCount:
 *           type: number
 *           description: The rating count of the restaurant
 *         creationTime:
 *           type: date
 *           description: The creation time of the post
 *       example:
 *         _id: 234t234t234t234t234t234t
 *         name: My Restaurant
 *         category: Fast Food
 *         address: 1234 My Address
 *         priceTypes: $$ - $$$
 *         rating: 4.5
 *         ratingCount: 100
 *         creationTime: 2025-01-22T14:04:07.120Z
 */
/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants
 *     description: Retrieve a list of all restaurants
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: A list of restaurants
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
 *                     $ref: '#/components/schemas/Restaurant'
 *       500:
 *         description: Server error
 */
router.get("/", restaurantsController.getAll);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID
 *     description: Retrieve a single restaurant by its ID
 *     tags:
 *       - Restaurants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the restaurant
 *     responses:
 *       200:
 *         description: A single restaurant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.get("/:id", restaurantsController.getById);

export default router;
