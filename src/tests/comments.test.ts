import supertest, { Agent } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentsModel, { IComments } from "../models/commentsModel";
import { Express } from "express";
import postModel from "../models/postsModel";
import userModel, { IUser } from "../models/usersModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await commentsModel.deleteMany();
  await postModel.deleteMany();
  await userModel.deleteMany();

  const testUser: IUser = {
    username: "Gal",
    email: "Gal@gmail.com",
    password: "secret",
    avatarUrl: "/public/avatar.png"
  };
  await supertest(app).post("/auth/register").send(testUser);
  const res = await supertest(app).post("/auth/login").send(testUser);
  senderId = res.body._id;
  const token = res.body.accessToken;
  expect(token).toBeDefined();

  request = supertest.agent(app).set({ authorization: `JWT ${token}` });

  const postResponse = await request.post("/posts").send({
    content: "Test Content",
    restaurantId: "123",
    restaurantName: "Test Restaurant",
    restaurnatCategory: "Test restaurnatCategory",
    restaurnatAddress: "Test restaurnatAddress",
    rating: 5,
    imageUrl: "/public/image.png",
  });
  comment.postId = postResponse.body._id;
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

let senderId = "";
let commentId = "";
const comment: IComments = {
  content: "This is a comment",
  postId: "",
  sender: ""
};

const assertComment = (actualComment: IComments) => {
  expect(actualComment.content).toBe(comment.content);
  expect(actualComment.postId).toBe(comment.postId);
  expect(actualComment.sender).toBe(senderId);
}

describe("Comments Tests", () => {
  test("Comments test get all", async () => {
    const response = await request.get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Comment", async () => {
    const response = await request.post("/comments").send(comment);
    expect(response.statusCode).toBe(201);
    assertComment(response.body);
    commentId = response.body._id;
  });

  test("Test Create Comment without post id", async () => {
    const { postId, ...rest } = comment;
    const response = await request.post("/comments").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Comments validation failed: postId: Path `postId` is required."
    );
  });

  test("Test Create Comment without content", async () => {
    const { content, ...rest } = comment;
    const response = await request.post("/comments").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Comments validation failed: content: Path `content` is required."
    );
  });

  test("Test Create Comment with post id of empty string", async () => {
    const response = await request
      .post("/comments")
      .send({ ...comment, postId: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Comments validation failed: postId: Path `postId` is required."
    );
  });

  test("Test Create Comment with content of empty string", async () => {
    const response = await request
      .post("/comments")
      .send({ ...comment, content: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Comments validation failed: content: Path `content` is required."
    );
  });

  test("Comments test get all", async () => {
    const response = await request.get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    assertComment(response.body[0]);
  });

  test("Test get comment by sender", async () => {
    const response = await request.get(
      `/comments?sender=${senderId}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    assertComment(response.body[0]);
  });

  test("Comments get post by id", async () => {
    const response = await request.get(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    assertComment(response.body);
  });

  test("Test get comment by post id", async () => {
    const response = await request.get(
      `/comments?postId=${comment.postId}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    assertComment(response.body[0]);
  });

  test("Test Update Comment", async () => {
    const response = await request.put(`/comments/${commentId}`).send({
      content: "The beginning of a new era",
    });
    comment.content = "The beginning of a new era"
    expect(response.statusCode).toBe(201);
    assertComment(response.body);
  });

  test("Test Delete Comment", async () => {
    const response = await request.delete(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    assertComment(response.body);
  });

  test("Test get comment by id that doesn't exist", async () => {
    const response = await request.get(`/comments/${commentId}`);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test update comment with not existing id", async () => {
    const response = await request.put(`/comments/${commentId}`).send({
      content: "HI there",
    });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test Create Comment to post that does not exist", async () => {
    await request.delete(`/posts/${comment.postId}`);
    const response = await request.post("/comments").send(comment);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
  });
});
