import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/isAuthenticated", (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.slice(6); // Remove "Bearer "
    console.log(JSON.stringify(req, getCircularReplacer()));
    if (!token) {
      return res.status(400).send({ code: "tokenNotReceived" });
    }

    const verified = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
    res.status(200).send({ code: "tokenValid", message: verified });
  } catch (err) {
    res.status(400).send("tokenInvalid");
  }
});

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: any, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export default router;
