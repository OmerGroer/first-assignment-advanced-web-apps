import userModel, { IUser } from "../models/usersModel";
import { Request, Response } from "express";
import BaseController from "./baseController";
import bcrypt from "bcrypt";
import { generateToken, verifyRefreshToken } from "../utils/tokenUtil";

class UsersController extends BaseController<IUser> {
  constructor() {
    super(userModel);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
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
        $or: [
          { email: req.body.email || "" },
          { username: req.body.username || "" },
        ],
      });
      if (!user) {
        res.status(400).send("wrong username/email or password");
        return;
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        res.status(400).send("wrong username/email or password");
        return;
      }

      if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error");
        return;
      }

      const tokens = generateToken(user._id);
      if (!tokens) {
        res.status(500).send("Server Error");
        return;
      }

      if (!user.refreshToken) {
        user.refreshToken = [];
      }
      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      res.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id,
      });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const user = await verifyRefreshToken(req.body.refreshToken);
      await user.save();

      res.status(200).send("success");
    } catch (err) {
      res.status(400).send("fail");
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const user = await verifyRefreshToken(req.body.refreshToken);
      if (!user) {
        res.status(400).send("fail");
        return;
      }

      const tokens = generateToken(user._id);
      if (!tokens) {
        res.status(500).send("Server Error");
        return;
      }

      if (!user.refreshToken) {
        user.refreshToken = [];
      }
      user.refreshToken.push(tokens.refreshToken);
      await user.save();

      res.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id,
      });
    } catch (err) {
      res.status(400).send("fail");
    }
  }
}

export default new UsersController();