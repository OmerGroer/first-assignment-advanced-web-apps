import { Request, Response } from "express";
import {
  FilterQuery,
  Model,
  QueryWithHelpers,
  RootFilterQuery,
  Types,
  UpdateQuery,
} from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: any) {
    this.model = model;

    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  private getFilter(req: Request, res: Response) {
    const filter: { [key: string]: any } = res.locals.additionalFilter || {};
    for (const field of this.getFilterFields()) {
      if (typeof field === "string") {
        if (req.query[field]) filter[field] = req.query[field];
      } else {
        const value = req.query[field.key];
        if (typeof value === "string") {
          filter[field.key] = field.value(value);
        }
      }
    }

    return filter;
  }

  private getLikeFilter(req: Request, res: Response) {
    const likeValue = req.query.like

    if (likeValue) { 
      return {$or: this.getLikeFields().map(field => ({[field]: {$regex: likeValue, $options: 'i'}}))};
    } else{
      return null;
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const filter = this.getFilter(req, res);
      const likeFilter = this.getLikeFilter(req, res);
      const mergedFilter = likeFilter ? {$and : [filter, likeFilter]} : filter

      const getItems = async () => {
        const limit = this.getLimit();
        const pipline = this.getAggregatePipeline(req, res);
        if (pipline.length > 0) {
          pipline.unshift({ $match: mergedFilter as RootFilterQuery<T> });
          pipline.push({ $sort: { creationTime: -1 } });
          if (limit !== Infinity) {
            pipline.push({ $limit: limit });
          }
          return await this.model.aggregate(pipline);
        } else {
          let query = this.model
            .find(mergedFilter as RootFilterQuery<T>)
            .sort({ creationTime: -1 });
          if (limit !== Infinity) {
            query = query.limit(limit);
          }
          return await this.populateResponse(query);
        }
      };

      const data = await getItems();
      res.send({ ...this.getMetaData(data, req, res), data });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  getMetaData(data: T[], req: Request, res: Response): { [key: string]: any } {
    return {};
  }

  getLimit(): number {
    return Infinity;
  }

  getAggregatePipeline(req: Request, res: Response): any[] {
    return [];
  }

  populateResponse(
    query: QueryWithHelpers<any, any, {}>
  ): QueryWithHelpers<any, any, {}> {
    for (const [key, value] of this.getPopulatedFields()) {
      query.populate(key, value);
    }

    return query;
  }

  getPopulatedFields(): Map<string, string> {
    return new Map<string, string>();
  }

  getFilterFields(): (string | { key: string; value: (key: string) => any })[] {
    return [];
  }

  getLikeFields(): string[] {
    return [];
  }

  async getByIdHelper(req: Request, res: Response, id: string) {
    const pipline = this.getAggregatePipeline(req, res);
    if (pipline.length > 0) {
      pipline.unshift({ $match: { _id: new Types.ObjectId(id) } });
      const items = await this.model.aggregate(pipline);
      return items.length > 0 ? items[0] : null;
    } else {
      return await this.populateResponse(this.model.findById(id));
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const item = await this.getByIdHelper(req, res, id);
      if (item != null) {
        res.send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async create(req: Request, res: Response) {
    const body = req.body;
    let id;

    try {
      const item = await this.model.create(body);
      id = item._id;
      await this.createHelper(req, res, item);
      const itemById = await this.getByIdHelper(req, res, item.id);
      res.status(201).send(itemById);
    } catch (error: any) {
      await this.model.deleteOne({ _id: id });
      if (error.code === 11000) {
        error = { message: "Duplicate Key" };
      } else {
        error = { message: error.message };
      }

      res.status(400).send(error);
    }
  }

  async createHelper(req: Request, res: Response, item: T) {}

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const filter = { $and: [{ _id: id }, this.addUserRestirction(req, res)] };
      const item = await this.populateResponse(
        this.model.findOneAndDelete(filter as FilterQuery<T>)
      );
      if (item) {
        await this.deleteHelper(req, res, item);
        res.status(200).send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async deleteHelper(req: Request, res: Response, item: T) {}

  getUpdateFields(): string[] {
    return [];
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const updateBody: { [key: string]: any } = {};
    for (const field of this.getUpdateFields()) {
      if (req.body[field]) updateBody[field] = req.body[field];
    }

    try {
      const filter = { $and: [{ _id: id }, this.addUserRestirction(req, res)] };

      const oldItem = await this.model.findById(id);
      const item = await this.populateResponse(
        this.model.findOneAndUpdate(
          filter as FilterQuery<T>,
          updateBody as UpdateQuery<T>,
          {
            new: true,
          }
        )
      );

      if (item && oldItem) {
        await this.updateHelper(req, res, oldItem, item);
        const newItem = await this.getByIdHelper(req, res, id);
        res.status(201).send(newItem);
      } else {
        res.status(404).send("not found");
      }
    } catch (error: any) {
      if (error.code === 11000) {
        error = { message: "Duplicate Key" };
      }

      res.status(400).send(error);
    }
  }

  async updateHelper(req: Request, res: Response, oldItem: T, item: T) {}

  addUserRestirction(req: Request, res: Response): { [key: string]: any } {
    return {};
  }
}

export default BaseController;
