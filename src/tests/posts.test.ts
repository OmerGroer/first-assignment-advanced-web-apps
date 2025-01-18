import supertest, { Agent } from "supertest"
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/usersModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await userModel.deleteMany();
  
  const testUser: IUser = {
    username: "Gal",
    email: "Gal@gmail.com",
    password: "secret",
  }
  await supertest(app).post("/auth/register").send(testUser);
  const res = await supertest(app).post("/auth/login").send(testUser);
  senderId = res.body._id;
  const token = res.body.accessToken;
  expect(token).toBeDefined();

  request = supertest.agent(app).set({ authorization: `JWT ${token}` });
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

let senderId = "";
let postId = "";
const post = {
  content: "Test Content",
  restaurantId: "123",
  restaurantName: "Test Restaurant",
  restaurnatCategory: "Test restaurnatCategory",
  restaurnatAddress: "Test restaurnatAddress",
  rating: 5
};

describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request.post("/posts").send(post);
    expect(response.statusCode).toBe(201);
    expect(response.body.restaurantId).toBe(post.restaurantId);
    expect(response.body.restaurantName).toBe(post.restaurantName);
    expect(response.body.restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body.restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body.rating).toBe(post.rating);
    expect(response.body.content).toBe(post.content);
    expect(response.body.sender).toBe(senderId);
    postId = response.body._id;
  });

  test("Test Create Post without restaurantId", async () => {
    const { restaurantId, ...rest } = post;
    const response = await request.post("/posts").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurantId: Path `restaurantId` is required."
    );
  });

  test("Test Create Post with restaurantId of empty string", async () => {
    const response = await request
      .post("/posts")
      .send({ ...post, restaurantId: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurantId: Path `restaurantId` is required."
    );
  });

  test("Test Create Post without restaurantName", async () => {
    const { restaurantName, ...rest } = post;
    const response = await request.post("/posts").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurantName: Path `restaurantName` is required."
    );
  });

  test("Test Create Post with restaurantName of empty string", async () => {
    const response = await request
      .post("/posts")
      .send({ ...post, restaurantName: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurantName: Path `restaurantName` is required."
    );
  });

  test("Test Create Post without restaurnatAddress", async () => {
    const { restaurnatAddress, ...rest } = post;
    const response = await request.post("/posts").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurnatAddress: Path `restaurnatAddress` is required."
    );
  });

  test("Test Create Post with restaurnatAddress of empty string", async () => {
    const response = await request
      .post("/posts")
      .send({ ...post, restaurnatAddress: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurnatAddress: Path `restaurnatAddress` is required."
    );
  });

  test("Test Create Post without rating", async () => {
    const { rating, ...rest } = post;
    const response = await request.post("/posts").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: rating: Path `rating` is required."
    );
  });

  test("Test Create Post with rating of empty string", async () => {
    const response = await request
      .post("/posts")
      .send({ ...post, rating: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: rating: Path `rating` is required."
    );
  });

  test("Test Create Post without content", async () => {
    const { content, ...rest } = post;
    const response = await request.post("/posts").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: content: Path `content` is required."
    );
  });

  test("Test Create Post with content of empty string", async () => {
    const response = await request
      .post("/posts")
      .send({ ...post, content: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: content: Path `content` is required."
    );
  });

  test("Test get post by sender", async () => {
    const response = await request.get(`/posts?sender=${senderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].restaurantId).toBe(post.restaurantId);
    expect(response.body[0].restaurantName).toBe(post.restaurantName);
    expect(response.body[0].restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body[0].restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body[0].rating).toBe(post.rating);
    expect(response.body[0].content).toBe(post.content);
    expect(response.body[0].sender).toBe(senderId);
  });

  test("Test get post by sender", async () => {
    const response = await request.get(`/posts?restaurantId=${post.restaurantId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].restaurantId).toBe(post.restaurantId);
    expect(response.body[0].restaurantName).toBe(post.restaurantName);
    expect(response.body[0].restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body[0].restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body[0].rating).toBe(post.rating);
    expect(response.body[0].content).toBe(post.content);
    expect(response.body[0].sender).toBe(senderId);
  });

  test("Test get post by id", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.restaurantId).toBe(post.restaurantId);
    expect(response.body.restaurantName).toBe(post.restaurantName);
    expect(response.body.restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body.restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body.rating).toBe(post.rating);
    expect(response.body.content).toBe(post.content);
    expect(response.body.sender).toBe(senderId);
  });

  test("Test Update Post's rating", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      rating: 3,
    });
    post.rating = 3;
    expect(response.statusCode).toBe(201);
    expect(response.body.restaurantId).toBe(post.restaurantId);
    expect(response.body.restaurantName).toBe(post.restaurantName);
    expect(response.body.restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body.restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body.rating).toBe(post.rating);
    expect(response.body.content).toBe(post.content);
    expect(response.body.sender).toBe(senderId);
  });

  test("Test Update Post's Content", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      content: "Welcome back today!",
    });
    post.content = "Welcome back today!";
    expect(response.statusCode).toBe(201);
    expect(response.body.restaurantId).toBe(post.restaurantId);
    expect(response.body.restaurantName).toBe(post.restaurantName);
    expect(response.body.restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body.restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body.rating).toBe(post.rating);
    expect(response.body.content).toBe(post.content);
    expect(response.body.sender).toBe(senderId);
  });

  test("Test get all posts", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].restaurantId).toBe(post.restaurantId);
    expect(response.body[0].restaurantName).toBe(post.restaurantName);
    expect(response.body[0].restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body[0].restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body[0].rating).toBe(post.rating);
    expect(response.body[0].content).toBe(post.content);
    expect(response.body[0].sender).toBe(senderId);
  });

  test("Test Create Post 2", async () => {
    const response = await request.post("/posts").send({
      content: "Test Content 2",
      restaurantId: "123 2",
      restaurantName: "Test Restaurant 2",
      restaurnatCategory: "Test restaurnatCategory 2",
      restaurnatAddress: "Test restaurnatAddress 2",
      rating: 4
    });
    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const response = await request.delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.restaurantId).toBe(post.restaurantId);
    expect(response.body.restaurantName).toBe(post.restaurantName);
    expect(response.body.restaurnatCategory).toBe(post.restaurnatCategory);
    expect(response.body.restaurnatAddress).toBe(post.restaurnatAddress);
    expect(response.body.rating).toBe(post.rating);
    expect(response.body.content).toBe(post.content);
    expect(response.body.sender).toBe(senderId);
  });

  test("Test get post by id that doesn't exist", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test Delete Post with not existing id", async () => {
    const response = await request.delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test Update Post with not existing id", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      title: "Test Post",
    });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test Update/Delete Post that is not owned by the user", async () => {
    const testUser: IUser = {
      username: "Omer",
      email: "Omer@gmail.com",
      password: "secret",
    }
    await supertest(app).post("/auth/register").send(testUser);
    const res = await supertest(app).post("/auth/login").send(testUser);
    const token = res.body.accessToken;
    expect(token).toBeDefined();
    const localRequest = supertest.agent(app).set({ authorization: `JWT ${token}` });

    const postReposne = await localRequest.post("/posts").send(post);
    expect(postReposne.statusCode).toBe(201);
    const postId = postReposne.body._id;
    
    const response = await request.put(`/posts/${postId}`).send({
      title: "Test Post",
    });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");

    const response2 = await request.delete(`/posts/${postId}`);
    expect(response2.statusCode).toBe(404);
    expect(response2.text).toBe("not found");
  });
});
