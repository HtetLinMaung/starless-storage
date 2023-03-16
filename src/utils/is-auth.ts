import { Request } from "express";

export default function isAuth(req: Request) {
  return req.query.access_key == process.env.access_key;
}
