import express from "express";
const router = express.Router();
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { authMiddleware } from "../controllers/usersController";
import path from "path";

/**
 * @swagger
 * tags:
 *   name: Fields
 *   description: The Files API
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, `${uuidv4()}.${ext}`);
  },
});

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file
 *     description: Upload a single file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The file url
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The file url
 *               example:
 *                 url: public/avatar.png
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
const upload = multer({ storage: storage });
router.post("/", upload.single("file"), (req, res) => {
  res.status(200).send({ url: `/${req.file?.path}` });
});

/**
 * @swagger
 * /file/{path}:
 *   delete:
 *     summary: Delete a file by path
 *     description: Delete a single file by its path
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the file
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/", authMiddleware, (req, res) => {
  const filePathInput = req.query.file;
console.log(filePathInput)
  if (typeof filePathInput === "string") {
    const projectRoot = path.resolve(__dirname, "../..");
    const filePath = path.join(projectRoot, filePathInput);
  
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error deleting file");
      }
      res.status(200).send("File deleted successfully");
    });
  } else {
    res.status(404).send("not found");
  }
});

export = router;
