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
  comment.postId = postResponse.body._id;
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

type Comment = IComments & {
  sender: { 
    _id: string,
    username: string,
    avatarUrl: string,
  };
};

const testUser: IUser = {
  username: "Gal",
  email: "Gal@gmail.com",
  password: "secret",
  avatarUrl: "/public/avatar.png"
};
let senderId = "";
let commentId = "";
const comment = {
  content: "This is a comment",
  postId: "",
};

const assertComment = (actualComment: Comment) => {
  expect(actualComment.content).toBe(comment.content);
  expect(actualComment.postId).toBe(comment.postId);
  expect(actualComment.sender._id).toBe(senderId);
  expect(actualComment.sender.username).toBe(testUser.username);
  expect(actualComment.sender.avatarUrl).toBe(testUser.avatarUrl);
}

describe("Comments Tests", () => {
  test("Comments test get all", async () => {
    const response = await request.get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test number of comments 0 in post", async () => {
    const response = await request.get(`/posts/${comment.postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.numberOfComments).toBe(0);
  });

  test("Test number of comments 0 in post in get all", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].numberOfComments).toBe(0);
  });

  test("Test Create Comment", async () => {
    const response = await request.post("/comments").send(comment);
    expect(response.statusCode).toBe(201);
    assertComment(response.body);
    commentId = response.body._id;
  });

  test("Test number of comments 1 in post", async () => {
    const response = await request.get(`/posts/${comment.postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.numberOfComments).toBe(1);
  });

  test("Test number of comments 1 in post in get all", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].numberOfComments).toBe(1);
  });

  test("Test Create Comment without post id", async () => {
    const { postId, ...rest } = comment;
    const response = await request.post("/comments").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
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
    expect(response.text).toBe("Post not found");
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
    const response = await request.get(`/comments?sender=${senderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    assertComment(response.body[0]);
  });

  test("Comments get by id", async () => {
    const response = await request.get(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    assertComment(response.body);
  });

  test("Test get comment by post id", async () => {
    const response = await request.get(`/comments?postId=${comment.postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    assertComment(response.body[0]);
  });

  test("Test Update Comment", async () => {
    const response = await request.put(`/comments/${commentId}`).send({
      content: "The beginning of a new era",
    });
    comment.content = "The beginning of a new era";
    expect(response.statusCode).toBe(201);
    assertComment(response.body);
  });

  test("Test Delete Comment", async () => {
    const response = await request.delete(`/comments/${commentId}`);
    expect(response.statusCode).toBe(200);
    assertComment(response.body);
  });

  test("Test number of comments 0 in post after delete comment", async () => {
    const response = await request.get(`/posts/${comment.postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.numberOfComments).toBe(0);
  });

  test("Test number of comments 0 in post in get all after delete comment", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].numberOfComments).toBe(0);
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

  test("Test Delete comment with not existing id", async () => {
    const response = await request.delete(`/comments/${commentId}`);
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");
  });

  test("Test Update/Delete comment that is not owned by the user", async () => {
    const testUser: IUser = {
      username: "Omer",
      email: "Omer@gmail.com",
      password: "secret",
      avatarUrl: "/public/avatar.png"
    };
    await supertest(app).post("/auth/register").send(testUser);
    const res = await supertest(app).post("/auth/login").send(testUser);
    const token = res.body.accessToken;
    expect(token).toBeDefined();
    const localRequest = supertest
      .agent(app)
      .set({ authorization: `JWT ${token}` });

    const commentReposne = await localRequest.post("/comments").send(comment);
    expect(commentReposne.statusCode).toBe(201);
    const commentId = commentReposne.body._id;

    const response = await request.put(`/comments/${commentId}`).send({
      content: "Test Post",
    });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("not found");

    const response2 = await request.delete(`/comments/${commentId}`);
    expect(response2.statusCode).toBe(404);
    expect(response2.text).toBe("not found");
  });

  test("Test Create Comment to post that does not exist", async () => {
    await request.delete(`/posts/${comment.postId}`);
    const response = await request.post("/comments").send(comment);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Post not found");
  });
});
