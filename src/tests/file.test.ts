import supertest, {Agent} from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel, { IUser } from "../models/usersModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();

  await supertest(app).post("/auth/register").send(testUser);
  const res = await supertest(app).post("/auth/login").send(testUser);
  const token = res.body.accessToken;
  expect(token).toBeDefined();

  request = supertest.agent(app).set({ authorization: `JWT ${token}` });
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
  avatarUrl: "/public/avatar.png",
};

describe("File Tests", () => {
  test("File test", async () => {
    const filePath = `${__dirname}/testFile.txt`;
    const response = await request.post("/file?file=test_file.txt").attach("file", filePath);
    expect(response.statusCode).toBe(200);
    const url = response.body.url;

    const response2 = await request.get(url);
    expect(response2.statusCode).toBe(200);

    const response3 = await request.delete(`/file?file=${url}`)
    expect(response3.statusCode).toBe(200);

    const response4 = await request.get(url);
    expect(response4.statusCode).not.toBe(200);
  });
});