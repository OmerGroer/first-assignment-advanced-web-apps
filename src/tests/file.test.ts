import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

describe("File Tests", () => {
  test("File test", async () => {
    const filePath = `${__dirname}/testFile.txt`;
    const response = await request(app).post("/file?file=test_file.txt").attach("file", filePath);
    expect(response.statusCode).toBe(200);
    const url = response.body.url;

    const response2 = await request(app).get(url);
    expect(response2.statusCode).toBe(200);
  });
});