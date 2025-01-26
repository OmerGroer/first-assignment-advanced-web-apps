import postModel, { IPost } from "../models/postsModel";
import { Request, Response } from "express";
import restaurantModel from "../models/restaurantsModel";
import { Types } from "mongoose";
import PagingController from "./pagingController";
import likesModel from "../models/likesModel";
import commentsModel from "../models/commentsModel";

class PostsController extends PagingController<IPost> {
    constructor() {
      super(postModel);
    }

    async create(req: Request, res: Response) {
      try { 
        res.locals.restaurant = req.body.restaurant;
        req.body = req.body.post;
        req.body.sender = res.locals.userId;
  
        await super.create(req, res);
      } catch (error) {
        res.status(400).send((error as Error).message);
      }
    }

    getAggregatePipeline(req: Request, res: Response) {
      return [
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $unwind: "$sender",
        },
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        {
          $unwind: "$restaurant",
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'postId',
            as: 'comments'
          }
        },
        {
          $addFields: {
            isLiked: {
              $in: [new Types.ObjectId(res.locals.userId), '$likes.userId']
            },
            numberOfComments: { $size: '$comments' }
          }
        },
        {
          $project: {
            _id: 1,
            sender: {
              _id: 1,
              username: 1,
              avatarUrl: 1,
            },
            restaurant: {
              _id: 1,
              name: 1,
            },
            rating: 1,
            content: 1,
            imageUrl: 1,
            isLiked: 1,
            numberOfComments: 1,
            creationTime: 1
          },
        },
      ];
    }

    getFilterFields() {
      return [{key: "sender", value: (key: string) => new Types.ObjectId(key)}, "restaurant"];
    }

    getUpdateFields() {
      return ["rating", "content", "imageUrl"];
    }

    addUserRestirction(req: Request, res: Response): { [key: string]: any; } {
      return { sender: res.locals.userId };
    }
    
    getPopulatedFields() {
      return new Map<string, string>([
        ["sender", "username avatarUrl"],
        ["restaurant", "name"],
      ]);
    }

    async createHelper(req: Request, res: Response, item: IPost) {
      const restaurant = res.locals.restaurant;
      const resturantDb = await restaurantModel.findById(item.restaurant).lean().exec() || {
        name: "",
        address: "",
        priceTypes: "",
        category: null
      };

      if (restaurant) {
        resturantDb.name = restaurant.name || resturantDb.name || null;
        if (!resturantDb.name) throw new Error("Restaurant Name is required");
        resturantDb.category = restaurant.category || resturantDb.category || null;
        resturantDb.address = restaurant.address || resturantDb.address || null;
        if (!resturantDb.address) throw new Error("Restaurant Address is required");
        resturantDb.priceTypes = restaurant.priceTypes || resturantDb.priceTypes || null;
        if (!resturantDb.priceTypes) throw new Error("Restaurant Price Types is required");
      }

      await restaurantModel.updateOne({_id: item.restaurant}, [
        {
          $set: {
            name: resturantDb.name,
            category: resturantDb.category,
            address: resturantDb.address,
            priceTypes: resturantDb.priceTypes,
            creationTime: { $ifNull: ["$field", new Date()] },
            ratingCount: { $add: [{ $ifNull: ["$ratingCount", 0] }, 1] },
            rating: {
              $divide: [
                { $add: [{ $multiply: [{ $ifNull: ["$rating", 0] }, { $ifNull: ["$ratingCount", 0] }] }, item.rating] },
                { $add: [{ $ifNull: ["$ratingCount", 0] }, 1] }
              ]
            }
          }
        }
      ], { upsert: true });
    }

    async updateHelper(req: Request, res: Response, oldItem: IPost, item: IPost) {
      await restaurantModel.updateOne({_id: item.restaurant}, [
        {
          $set: {
            rating: {
              $divide: [
                { $subtract: [{ $add: [{ $multiply: ["$rating", "$ratingCount"] }, item.rating] }, oldItem.rating] },
                "$ratingCount"
              ]
            }
          }
        }
      ]);
    }

    async deleteHelper(req: Request, res: Response, item: IPost) {
      await restaurantModel.updateOne({_id: item.restaurant}, [
        {
          $set: {
            ratingCount: { $subtract: ["$ratingCount", 1] },
            rating: {
              $cond: {
                if: { $ne: ["$ratingCount", 1] },
                then: {
                  $divide: [
                    { $subtract: [{ $multiply: ["$rating", "$ratingCount"] }, item.rating] },
                    {
                      $cond: {
                        if: { $ne: ["$ratingCount", 1] },
                        then: { $subtract: ["$ratingCount", 1] },
                        else: 1
                      }
                    }
                  ]
                },
                else: 0
              }
            }
          }
        }
      ]);
      await restaurantModel.deleteOne({ _id: item.restaurant, ratingCount: 0 });
      await likesModel.deleteMany({postId: req.params.id});
      await commentsModel.deleteMany({postId: req.params.id});
    }

    getLimit(): number {
      return Number(process.env.LIMIT_DOCUMENTS_POST);
    }
  }

  export default new PostsController();