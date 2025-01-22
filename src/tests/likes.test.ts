import supertest, { Agent } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import postModel from "../models/postsModel";
import userModel, { IUser } from "../models/usersModel";
import likesModel, { ILikes } from "../models/likesModel";
import restaurantModel from "../models/restaurantsModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await likesModel.deleteMany();
  await postModel.deleteMany();
  await restaurantModel.deleteMany();
  await userModel.deleteMany();

  await supertest(app).post("/auth/register").send(testUser);
  const res = await supertest(app).post("/auth/login").send(testUser);
  senderId = res.body._id;
  const token = res.body.accessToken;
  expect(token).toBeDefined();

  request = supertest.agent(app).set({ authorization: `JWT ${token}` });

  const postResponse = await request.post("/posts").send({post: {
    content: "Test Content",
    restaurant: "123",
    rating: 5,
    imageUrl: "/public/image.png",
  }, restaurant: {
    name: "Test Restaurant",
    category: "Test Category",
    address: "Test Address",
    priceTypes: "Test Price Types",
  }});
  postId = postResponse.body._id;
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

const testUser: IUser = {
  username: "Gal",
  email: "Gal@gmail.com",
  password: "secret",
  avatarUrl: "/public/avatar.png"
};
let senderId = "";
let postId = "";

const assertLike = (actualLike: ILikes) => {
  expect(actualLike.postId).toBe(postId);
  expect(actualLike.userId).toBe(senderId);
}

describe("Likes Tests", () => {
  test("Test isLiked false in post", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.isLiked).toBe(false);
  });

  test("Test isLiked false in post in get all", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data[0].isLiked).toBe(false);
  });

  test("Test Create Like", async () => {
    const response = await request.post("/likes").send({ postId });
    expect(response.statusCode).toBe(201);
    assertLike(response.body);
  });

  test("Test isLiked true in post", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.isLiked).toBe(true);
  });

  test("Test isLiked true in post in get all", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data[0].isLiked).toBe(true);
  });

  test("Test isLiked false to another user", async () => {
    const testUser: IUser = {
      username: "Omer",
      email: "Omer@gmail.com",
      password: "secret",
      avatarUrl: "/public/avatar.png",
    }
    await supertest(app).post("/auth/register").send(testUser);
    const res = await supertest(app).post("/auth/login").send(testUser);
    const token = res.body.accessToken;
    expect(token).toBeDefined();
    const localRequest = supertest.agent(app).set({ authorization: `JWT ${token}` });

    const response = await localRequest.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.isLiked).toBe(false);
  });

  test("Test Create Like without post id", async () => {
    const response = await request.post("/likes").send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
  });

  test("Test Create Like with post id of empty string", async () => {
    const response = await request.post("/likes").send({ postId: "" });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
  });

  test("Test Delete Like", async () => {
    const response = await request.delete(`/likes/${postId}`);
    expect(response.statusCode).toBe(200);
    assertLike(response.body);
  });

  test("Test isLiked false in post after unlike", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.isLiked).toBe(false);
  });

  test("Test isLiked false in post in get all after unlike", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data[0].isLiked).toBe(false);
  });

  test("Test Delete like with not existing id", async () => {
    const response = await request.delete(`/likes/${postId}`);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });


  test("Test Create like to post that does not exist", async () => {
    await request.delete(`/posts/${postId}`);
    const response = await request.post("/likes").send({ postId });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
  });
});
