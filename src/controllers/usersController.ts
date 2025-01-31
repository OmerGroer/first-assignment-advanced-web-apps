import userModel, { IUser } from "../models/usersModel";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import PagingController from "./pagingController";
import { OAuth2Client } from "google-auth-library";

type Payload = {
  _id: string;
};

type tTokens = {
  accessToken: string;
  refreshToken: string;
};

type tUser = Document<unknown, {}, IUser> &
  IUser &
  Required<{
    _id: string;
  }> & {
    __v: number;
  };

const generateToken = (userId: string): tTokens | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }

  const random = Math.random().toString();
  const accessToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );
  const refreshToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const returnTokens = async (
  res: Response,
  userId: string,
  user: Document & IUser
) => {
  const tokens = generateToken(userId);
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
    _id: userId,
  });
};

const verifyRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<tUser>((resolve, reject) => {
    //get refresh token from body
    if (!refreshToken) {
      reject("fail");
      return;
    }

    //verify token
    if (!process.env.TOKEN_SECRET) {
      reject("fail");
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET,
      async (err: any, payload: any) => {
        if (err) {
          reject("fail");
          return;
        }

        //get the user id fromn token
        const userId = payload._id;

        try {
          //get the user form the db
          const user = await userModel.findById(userId);

          if (!user) {
            reject("fail");
            return;
          }

          if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
            user.refreshToken = [];
            await user.save();
            reject("fail");
            return;
          }

          const tokens = user.refreshToken!.filter(
            (token) => token !== refreshToken
          );
          user.refreshToken = tokens;

          resolve(user);
        } catch (err) {
          reject("fail");
          return;
        }
      }
    );
  });
};

class UsersController extends PagingController<IUser> {
  client: OAuth2Client;

  constructor() {
    super(userModel);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.googleSignin = this.googleSignin.bind(this);

    this.client = new OAuth2Client();
  }

  async create(req: Request, res: Response) {
    try {
      const password = req.body.password;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
      }

      const body = req.body;
      const user = await this.model.create(body);
      await returnTokens(res, user._id, user);
    } catch (error: any) {
      if (error.code === 11000) {
        error = { message: "Duplicate email or username" };
      } else {
        error = { message: error.message };
      }

      res.status(400).send(error);
    }
  }

  async googleSignin(req: Request, res: Response) {
    const credential = req.body.credential;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const email = payload?.email;
      let user = await this.model.findOne({ email });
      if (user == null) {
        user = await this.model.create({
          email: email,
          username: payload?.name,
          avatarUrl: payload?.picture,
          password: "google-signin",
        });
      }

      await returnTokens(res, user._id, user);
    } catch (error: any) {
      if (error.code === 11000) {
        error = { message: "Duplicate email or username" };
      } else {
        error = { message: error.message };
      }

      res.status(400).send(error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const password = req.body.password;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
      }

      await super.update(req, res);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  getFilterFields() {
    return ["username", "email"];
  }

  getUpdateFields() {
    return ["username", "email", "password", "avatarUrl"];
  }

  addUserRestirction(req: Request, res: Response): { [key: string]: any } {
    return { _id: res.locals.userId };
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
        res.status(400).send("Wrong username/email or password");
        return;
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        res.status(400).send("Wrong username/email or password");
        return;
      }

      if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error");
        return;
      }

      await returnTokens(res, user._id, user);
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

      await returnTokens(res, user._id, user);
    } catch (err) {
      res.status(400).send("fail");
    }
  }

  getLimit(): number {
    return Number(process.env.LIMIT_DOCUMENTS_USER);
  }

  getLikeFields(): string[] {
    return ["username"];
  }
}

export default new UsersController();

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
