import requestFunc, { Agent } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import bcrypt from "bcrypt";
import userModel, { IUser } from "../models/usersModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();

  request = requestFunc(app)
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

type User = IUser & { token?: string };

const user: User = {
  username: "Gal",
  email: "test@user.com",
  password: "testpassword",
};

describe("Auth Tests", () => {
  test("Test Create User", async () => {
    const response = await request.post("/auth/register").send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe(user.username);
    expect(response.body.email).toBe(user.email);
    const validPassword = await bcrypt.compare(
      user.password,
      response.body.password
    );
    expect(validPassword).toBe(true);
    user._id = response.body._id;
  });

  test("Test Create user without username", async () => {
    const { username, ...rest } = user;
    const response = await request.post("/auth/register").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: username: Path `username` is required."
    );
  });

  test("Test Create user without email", async () => {
    const { email, ...rest } = user;
    const response = await request.post("/auth/register").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: email: Path `email` is required."
    );
  });

  test("Test Create user without password", async () => {
    const { password, ...rest } = user;
    const response = await request.post("/auth/register").send(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: password: Path `password` is required."
    );
  });

  test("Test Create user with username of empty string", async () => {
    const response = await request
      .post("/auth/register")
      .send({ ...user, username: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: username: Path `username` is required."
    );
  });

  test("Test Create user with email of empty string", async () => {
    const response = await request.post("/auth/register").send({ ...user, email: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: email: Path `email` is required."
    );
  });

  test("Test Create user with password of empty string", async () => {
    const response = await request
      .post("/auth/register")
      .send({ ...user, password: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Users validation failed: password: Path `password` is required."
    );
  });

  test("Auth test login with username", async () => {
    const response = await request.post("/auth/login").send({username: user.username, password: user.password});
    expect(response.statusCode).toBe(200);
    const token = response.body.token;
    expect(token).toBeDefined();
    expect(response.body._id).toBe(user._id);
    user.token = token;
  });

  test("Auth test login with email", async () => {
    const response = await request.post("/auth/login").send({email: user.email, password: user.password});
    expect(response.statusCode).toBe(200);
    const token = response.body.token;
    expect(token).toBeDefined();
    expect(response.body._id).toBe(user._id);
    user.token = token;
  });

  test("Login with not existing username", async () => {
    const response = await request.post("/auth/login").send({username: "HI", password: user.password});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("wrong username/email or password");
  });

  test("Login with not existing email", async () => {
    const response = await request.post("/auth/login").send({email: "HI", password: user.password});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("wrong username/email or password");
  });

  test("Login with not matching password", async () => {
    const response = await request.post("/auth/login").send({email: user.email, password: "no"});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("wrong username/email or password");
  });

  test("Login with nothing", async () => {
    const response = await request.post("/auth/login").send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("wrong username/email or password");
  });

  test("Auth test without token", async () => {
    const response = await request.get("/users");
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Access Denied");
  });

  test("Auth test with token", async () => {
    const response = await request.get("/users").set({ authorization: `JWT ${user.token}` }).expect(200);
    expect(response.statusCode).toBe(200);
  });
});
