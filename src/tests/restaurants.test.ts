import supertest, { Agent } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel, { IPost } from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/usersModel";
import restaurantModel, { IRestaurant } from "../models/restaurantsModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await restaurantModel.deleteMany();

  const res = await supertest(app).post("/auth/register").send(testUser);
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
const testUser: IUser = {
  username: "Gal",
  email: "Gal@gmail.com",
  password: "secret",
  avatarUrl: "/public/avatar.png",
};
const post = {
  content: "Test Content",
  restaurant: "123",
  rating: 5,
  imageUrl: "/public/image.png",
};
const testRestaurant = (id: string) => ({
  _id: id,
  name: `Test Restaurant ${id}`,
  category: `Test Category ${id}`,
  address: `Test Address ${id}`,
  priceTypes: "Test Price"
});

const assertRestaurantHelper = (restaurant: IRestaurant, ratingCount: number, rating: number) => {
  const expected = testRestaurant(restaurant._id)
  expect(restaurant._id).toBe(expected._id);
  expect(restaurant.name).toBe(expected.name);
  expect(restaurant.category).toBe(expected.category);
  expect(restaurant.address).toBe(expected.address);
  expect(restaurant.priceTypes).toBe(expected.priceTypes);
  expect(restaurant.ratingCount).toBe(ratingCount);
  expect(restaurant.rating).toBe(rating);
}

const createPost = async (post: any, restaurant: any = testRestaurant) => {
  return await request.post("/posts").send({post, restaurant});
}

describe("Restaurant Tests", () => {
  test("Test Restaurant Pagination", async () => {
    await postModel.deleteMany();
    await restaurantModel.deleteMany();

    await createPost({...post, restaurant: "1"}, testRestaurant("1"));
    await createPost({...post, restaurant: "2"}, testRestaurant("2"));
    await createPost({...post, restaurant: "3"}, testRestaurant("3"));

    const responseRestaurant = await request.get("/restaurants");
    expect(responseRestaurant.statusCode).toBe(200);
    expect(responseRestaurant.body.data.length).toBe(2);
    expect(responseRestaurant.body.data[0]._id).toBe("3")
    expect(responseRestaurant.body.data[1]._id).toBe("2")
    assertRestaurantHelper(responseRestaurant.body.data[1], 1, 5)
    let minRestaurant = responseRestaurant.body.min
    let maxRestaurant = responseRestaurant.body.max

    const responseRestaurant2 = await request.get(`/restaurants?min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant2.statusCode).toBe(200);
    expect(responseRestaurant2.body.data.length).toBe(1);
    expect(responseRestaurant2.body.data[0]._id).toBe("1")
    minRestaurant = responseRestaurant2.body.min
    maxRestaurant = responseRestaurant2.body.max

    const responseRestaurant3 = await request.get(`/restaurants?min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant3.statusCode).toBe(200);
    expect(responseRestaurant3.body.data.length).toBe(0);
    expect(responseRestaurant3.body.min).toBe(minRestaurant)
    expect(responseRestaurant3.body.max).toBe(maxRestaurant)

    const fourthId = (await createPost({...post, restaurant: "4"}, testRestaurant("4"))).body._id;
    const responseRestaurant4 = await request.get(`/restaurants?min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant4.statusCode).toBe(200);
    expect(responseRestaurant4.body.data.length).toBe(1);
    expect(responseRestaurant4.body.data[0]._id).toBe("4")
  });

  test("Like name value", async () => {
    const responseRestaurant = await request.get("/restaurants?like=Restaurant");
    expect(responseRestaurant.statusCode).toBe(200);
    expect(responseRestaurant.body.data.length).toBe(2);
    expect(responseRestaurant.body.data[0]._id).toBe("4")
    expect(responseRestaurant.body.data[1]._id).toBe("3")
    let minRestaurant = responseRestaurant.body.min
    let maxRestaurant = responseRestaurant.body.max

    const responseRestaurant2 = await request.get(`/restaurants?like=Restaurant&min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant2.statusCode).toBe(200);
    expect(responseRestaurant2.body.data.length).toBe(2);
    expect(responseRestaurant2.body.data[0]._id).toBe("2")
    expect(responseRestaurant2.body.data[1]._id).toBe("1")

    const responseRestaurant3 = await request.get("/restaurants?like=3");
    expect(responseRestaurant3.statusCode).toBe(200);
    expect(responseRestaurant3.body.data.length).toBe(1);
    expect(responseRestaurant3.body.data[0]._id).toBe("3")
  });

  test("Like address value", async () => {
    const responseRestaurant = await request.get("/restaurants?like=Address");
    expect(responseRestaurant.statusCode).toBe(200);
    expect(responseRestaurant.body.data.length).toBe(2);
    expect(responseRestaurant.body.data[0]._id).toBe("4")
    expect(responseRestaurant.body.data[1]._id).toBe("3")
    let minRestaurant = responseRestaurant.body.min
    let maxRestaurant = responseRestaurant.body.max

    const responseRestaurant2 = await request.get(`/restaurants?like=Address&min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant2.statusCode).toBe(200);
    expect(responseRestaurant2.body.data.length).toBe(2);
    expect(responseRestaurant2.body.data[0]._id).toBe("2")
    expect(responseRestaurant2.body.data[1]._id).toBe("1")
  });

  test("Like Category value", async () => {
    const responseRestaurant = await request.get("/restaurants?like=Category");
    expect(responseRestaurant.statusCode).toBe(200);
    expect(responseRestaurant.body.data.length).toBe(2);
    expect(responseRestaurant.body.data[0]._id).toBe("4")
    expect(responseRestaurant.body.data[1]._id).toBe("3")
    let minRestaurant = responseRestaurant.body.min
    let maxRestaurant = responseRestaurant.body.max

    const responseRestaurant2 = await request.get(`/restaurants?like=Category&min=${minRestaurant}&max=${maxRestaurant}`);
    expect(responseRestaurant2.statusCode).toBe(200);
    expect(responseRestaurant2.body.data.length).toBe(2);
    expect(responseRestaurant2.body.data[0]._id).toBe("2")
    expect(responseRestaurant2.body.data[1]._id).toBe("1")
  });

  test("by Id", async () => {
    const response = await request.get(`/restaurants/1`);
    expect(response.statusCode).toBe(200);
    assertRestaurantHelper(response.body, 1, 5)
  });
});
