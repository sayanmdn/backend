import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/isAuthenticated", (req: Request, res: Response) => {
  try {
    const { authorization: token } = req.headers;
    if (!token) {
      return res.status(400).send({ code: "tokenNotReceived" });
    }

    const verified = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
    res.status(200).send({ code: "tokenValid", message: verified });
  } catch (err) {
    res.status(400).send("tokenInvalid");
  }
});

export default router;
