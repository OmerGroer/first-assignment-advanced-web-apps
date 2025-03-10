import dotenv from "dotenv";

dotenv.config({
  path: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ""}`,
});

import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import postsRoute from "./routes/postRoutes";
import commentsRoute from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";
import restaurantRoutes from "./routes/restaurantRoutes";
import authRoutes from "./routes/authRoutes";
import fileRoute from "./routes/fileRoutes";
import likeRoues from "./routes/likeRoutes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/users", userRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/auth", authRoutes);
app.use("/file", fileRoute);
app.use("/likes", likeRoues);
app.use("/public", express.static("public"));

const frontEndpoints = ["/", "/new", "/search/restaurants", "/search/users", "/profile"]
frontEndpoints.forEach(endpoint => app.use(endpoint, express.static("front")));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [
      { url: `http://localhost:${process.env.PORT}` },
      { url: "http://10.10.246.35" },
      { url: "https://10.10.246.35" },
      { url: "https://node35.cs.colman.ac.il" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.DB_CONNECT) {
      reject("DB_CONNECT is not defined in .env file");
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          resolve(app);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export default initApp;
