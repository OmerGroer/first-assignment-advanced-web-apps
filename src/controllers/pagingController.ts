import { Request, Response } from "express";
import BaseController from "./baseController";

export interface IPagingModel {
  creationTime?: Date;
}

class PagingController<T extends IPagingModel> extends BaseController<T> {
  async getAll(req: Request, res: Response) {
    try {
      const {min, max} = this.getMinMax(req)
      const filters = []
      if (min) filters.push({creationTime: {$lt: min}})
      if (max) filters.push({creationTime: {$gt: max}})
      if (filters.length) res.locals.additionalFilter = {$or: filters}

      await super.getAll(req, res);
    } catch (error) {
      res.status(400).send((error as Error).message);
    }
  }

  getMetaData(data: T[], req: Request, res: Response): { [key: string]: any } {
    let {min, max} = this.getMinMax(req)

    for (const item of data) {
      const creationTime = item.creationTime;
      if (creationTime) {
        if (!min || min > creationTime) min = creationTime;
        if (!max || max < creationTime) max = creationTime;
      }
    }

    return { min, max };
  }

  getMinMax(req: Request): {min: Date|null, max: Date|null} {
    const rawMin = req.query.min;
    let min: Date | null = null;
    if (typeof rawMin === "string") min = new Date(rawMin);

    const rawMax = req.query.max;
    let max: Date | null = null;
    if (typeof rawMax === "string") max = new Date(rawMax);

    return {min, max}
  }

  getLimit(): number {
    return Number(process.env.LIMIT_DOCUMENTS);
  }
}

export default PagingController;
