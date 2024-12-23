import userModel, { IUser } from "../models/usersModel";
import { NextFunction, Request, Response } from "express";
import BaseController from "./baseController";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UsersController extends BaseController<IUser> {
  constructor() {
    super(userModel);

    this.login = this.login.bind(this);
  }

  async create(req: Request, res: Response) {
    try {
      const password = req.body.password;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
      }

      await super.create(req, res);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  getFilterFields() {
    return ["username", "email"];
  }

  getUpdateFields() {
    return ["username", "email", "password"];
  }

  async login(req: Request, res: Response) {
    try {
      const user = await userModel.findOne({
        $or: [{ email: req.body.email || "" }, { username: req.body.username || "" }],
      });
      if (!user) {
        res.status(400).send("wrong username/email or password");
        return;
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        res.status(400).send("wrong username/email or password");
        return;
      }

      if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error");
        return;
      }

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRES,
      });
      res.status(200).send({ token: token, _id: user._id });
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

export default new UsersController();

type Payload = {
  _id: string;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("Server Error");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }

    res.locals.userId = (payload as Payload)._id;
    next();
  });
};
