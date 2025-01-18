import { Request, Response } from "express";
import { FilterQuery, Model, RootFilterQuery, UpdateQuery } from "mongoose";

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

  async getAll(req: Request, res: Response) {
    try {
      const filter: { [key: string]: any } = {};
      for (const field of this.getFilterFields()) {
        if (req.query[field]) filter[field] = req.query[field];
      }

      const items = await this.model.find(filter as RootFilterQuery<T>);
      res.send(items);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  getFilterFields(): string[] {
    return [];
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const item = await this.model.findById(id);
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
    try {
      const item = await this.model.create(body);
      res.status(201).send(item);
    } catch (error: any) {
      if (error.code === 11000) {
        error = { message: "Duplicate Key" }
      }

      res.status(400).send(error);
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const filter = { $and: [{_id: id}, this.addUserRestirction(req, res)] };
      const item = await this.model.findOneAndDelete(filter as FilterQuery<T>);
      if (item) {
        res.status(200).send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

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
      const filter = { $and: [{_id: id}, this.addUserRestirction(req, res)] };

      const item = await this.model.findOneAndUpdate(
        filter as FilterQuery<T>,
        updateBody as UpdateQuery<T>,
        {
          new: true,
        }
      );

      if (item) {
        res.status(201).send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error: any) {
      if (error.code === 11000) {
        error = { message: "Duplicate Key" }
      }

      res.status(400).send(error);
    }
  }

  addUserRestirction(req: Request, res: Response): { [key: string]: any } {
    return {};
  }
}

export default BaseController;