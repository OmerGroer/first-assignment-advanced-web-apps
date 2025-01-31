import supertest, { Agent } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel, { IPost } from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/usersModel";
import restaurantModel, { IRestaurant } from "../models/restaurantsModel";
import commentsModel from "../models/commentsModel";

var app: Express;
var request: Agent;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await restaurantModel.deleteMany();
  await commentsModel.deleteMany();

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

type Post = IPost & {
  sender: { 
    _id: string,
    username: string,
    avatarUrl: string,
  };
  restaurant: {
    _id: string,
    name: string,
  };
};

let senderId = "";
let postId = "";
let secondPostId = "";
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
const testRestaurant = {
  _id: "123",
  name: "Test Restaurant",
  category: "Test Category",
  address: "Test Address",
  priceTypes: "Test Price"
};

const assertPost = (actualPost: Post) => {
  expect(actualPost.restaurant._id).toBe(post.restaurant);
  expect(actualPost.restaurant.name).toBe(testRestaurant.name);
  expect(actualPost.rating).toBe(post.rating);
  expect(actualPost.content).toBe(post.content);
  expect(actualPost.imageUrl).toBe(post.imageUrl);
  expect(actualPost.sender._id).toBe(senderId);
  expect(actualPost.sender.username).toBe(testUser.username);
  expect(actualPost.sender.avatarUrl).toBe(testUser.avatarUrl);
};

const assertRestaurant = async (restaurantId: string, ratingCount: number, rating: number) => {
  const response = await request.get(`/restaurants/${restaurantId}`);
  expect(response.statusCode).toBe(200);
  assertRestaurantHelper(response.body, ratingCount, rating)
}

const assertRestaurantHelper = (restaurant: IRestaurant, ratingCount: number, rating: number) => {
  expect(restaurant.name).toBe(testRestaurant.name);
  expect(restaurant.category).toBe(testRestaurant.category);
  expect(restaurant.address).toBe(testRestaurant.address);
  expect(restaurant.priceTypes).toBe(testRestaurant.priceTypes);
  expect(restaurant.ratingCount).toBe(ratingCount);
  expect(restaurant.rating).toBe(rating);
}

const createPost = async (post: any, restaurant: any = testRestaurant) => {
  return await request.post("/posts").send({post, restaurant});
}

describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(0);
  });

  test("Test Create Post without restaurant name of new restaurant", async () => {
    const { name, ...rest } = testRestaurant;
    const response = await createPost(post, rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Name is required"
    );
  });

  test("Test Create Post with restaurant name of empty string of new restaurant", async () => {
    const response = await createPost(post, { ...testRestaurant, name: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Name is required"
    );
  });

  test("Test Create Post without restaurnat address of new restaurant", async () => {
    const { address, ...rest } = testRestaurant;
    const response = await createPost(post, rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Address is required"
    );
  });

  test("Test Create Post with restaurnat address of empty string of new restaurant", async () => {
    const response = await createPost(post, { ...testRestaurant, address: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Address is required"
    );
  });

  test("Test Create Post without restaurnat priceTypes of new restaurant", async () => {
    const { priceTypes, ...rest } = testRestaurant;
    const response = await createPost(post, rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Price Types is required"
    );
  });

  test("Test Create Post with restaurnat priceTypes of empty string of new restaurant", async () => {
    const response = await createPost(post, { ...testRestaurant, priceTypes: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Restaurant Price Types is required"
    );
  });

  test("Test Create Post", async () => {
    const response = await createPost(post);
    expect(response.statusCode).toBe(201);
    assertPost(response.body);
    postId = response.body._id;

    assertRestaurant(post.restaurant, 1, 5);
  });

  test("Test Create Post without restaurant", async () => {
    const { restaurant, ...rest } = post;
    const response = await createPost(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurant: Path `restaurant` is required."
    );
  });

  test("Test Create Post with restaurant of empty string", async () => {
    const response = await createPost({ ...post, restaurant: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: restaurant: Path `restaurant` is required."
    );
  });

  test("Test Create Post without rating", async () => {
    const { rating, ...rest } = post;
    const response = await createPost(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: rating: Path `rating` is required."
    );
  });

  test("Test Create Post with rating not in range", async () => {
    const response = await createPost({ ...post, rating: 6 });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: rating: Rating must be between 1 and 5"
    );
  });

  test("Test Create Post with rating of 0", async () => {
    const response = await createPost({ ...post, rating: 0 });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: rating: Rating must be between 1 and 5"
    );
  });

  test("Test Create Post without content", async () => {
    const { content, ...rest } = post;
    const response = await createPost(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: content: Path `content` is required."
    );
  });

  test("Test Create Post with content of empty string", async () => {
    const response = await createPost({ ...post, content: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: content: Path `content` is required."
    );
  });

  test("Test Create Post without Image", async () => {
    const { imageUrl, ...rest } = post;
    const response = await createPost(rest);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: imageUrl: Path `imageUrl` is required."
    );
  });

  test("Test Create Post with image url of empty string", async () => {
    const response = await createPost({ ...post, imageUrl: "" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Posts validation failed: imageUrl: Path `imageUrl` is required."
    );
  });

  test("Test get post by sender", async () => {
    const response = await request.get(`/posts?sender=${senderId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    assertPost(response.body.data[0]);
  });

  test("Test get post by sender", async () => {
    const response = await request.get(
      `/posts?restaurant=${post.restaurant}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    assertPost(response.body.data[0]);
  });

  test("Test get post by id", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    assertPost(response.body);
  });

  test("Test Update Post's rating", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      rating: 3,
    });
    post.rating = 3;
    expect(response.statusCode).toBe(201);
    assertPost(response.body);
    assertRestaurant(post.restaurant, 1, 3);
  });

  test("Test Update Post's Content", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      content: "Welcome back today!",
    });
    post.content = "Welcome back today!";
    expect(response.statusCode).toBe(201);
    assertPost(response.body);
  });

  test("Test Update Post's Image", async () => {
    const response = await request.put(`/posts/${postId}`).send({
      imageUrl: "/public/image2.png",
    });
    post.imageUrl = "/public/image2.png";
    expect(response.statusCode).toBe(201);
    assertPost(response.body);
  });

  test("Test get all posts", async () => {
    const response = await request.get(`/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    assertPost(response.body.data[0]);
  });

  test("Test Create Post 2", async () => {
    const restaurant = {
      _id: "123",
      name: "Test Restaurant 2",
      category: "Test restaurnatCategory 2",
    }
    const response = await createPost({
      content: "Test Content 2",
      restaurant: "123",
      rating: 4,
      imageUrl: "/public/image2.png",
    }, restaurant);
    expect(response.statusCode).toBe(201);
    secondPostId = response.body._id;

    testRestaurant.name = restaurant.name;
    testRestaurant.category = restaurant.category;

    assertRestaurant(restaurant._id, 2, 3.5);
  });

  test("Posts test get all 2", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const responseComment = await request.post("/comments").send({
      content: "This is a comment",
      postId: postId,
    });
    expect(responseComment.statusCode).toBe(201);
    const responseComment2 = await request.get(`/comments?postId=${postId}`);
    expect(responseComment2.statusCode).toBe(200);
    expect(responseComment2.body.data.length).toBe(1);

    const response = await request.delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    assertPost(response.body);
    assertRestaurant(post.restaurant, 1, 4);

    const response2 = await request.delete(`/posts/${secondPostId}`);
    expect(response2.statusCode).toBe(200);
    const response3 = await request.get(`/restaurants/${post.restaurant}`);
    expect(response3.statusCode).toBe(404);
    expect(response3.text).toBe("not found");

    const responseComment3 = await request.get(`/comments?postId=${postId}`);
    expect(responseComment3.statusCode).toBe(200);
    expect(responseComment3.body.data.length).toBe(0);
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
      avatarUrl: "/public/avatar.png",
    }
    const res = await supertest(app).post("/auth/register").send(testUser);
    const token = res.body.accessToken;
    expect(token).toBeDefined();
    const localRequest = supertest.agent(app).set({ authorization: `JWT ${token}` });

    const postReposne = await localRequest.post("/posts").send({post, restaurant: testRestaurant});
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

  test("Test Post Pagination", async () => {
    await postModel.deleteMany();
    await restaurantModel.deleteMany();

    const firstId = (await createPost({...post, restaurant: "1"}, {...testRestaurant, _id: "1"})).body._id;
    const secondId = (await createPost({...post, restaurant: "2"}, {...testRestaurant, _id: "2"})).body._id;
    const thirdId = (await createPost({...post, restaurant: "3"}, {...testRestaurant, _id: "3"})).body._id;

    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0]._id).toBe(thirdId)
    expect(response.body.data[1]._id).toBe(secondId)
    let min = response.body.min
    let max = response.body.max

    const response2 = await request.get(`/posts?min=${min}&max=${max}`);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.data.length).toBe(1);
    expect(response2.body.data[0]._id).toBe(firstId)
    min = response2.body.min
    max = response2.body.max

    const response3 = await request.get(`/posts?min=${min}&max=${max}`);
    expect(response3.statusCode).toBe(200);
    expect(response3.body.data.length).toBe(0);
    expect(response3.body.min).toBe(min)
    expect(response3.body.max).toBe(max)

    const fourthId = (await createPost({...post, restaurant: "4"}, {...testRestaurant, _id: "4"})).body._id;
    const response4 = await request.get(`/posts?min=${min}&max=${max}`);
    expect(response4.statusCode).toBe(200);
    expect(response4.body.data.length).toBe(1);
    expect(response4.body.data[0]._id).toBe(fourthId)
  });
});
