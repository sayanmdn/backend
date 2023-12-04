import express from "express";
import userModel from "../models/User";
import { isEmpty } from "lodash";

import { Request, Response } from "express";

const router = express.Router();

router.post("/find", async (req: Request, res: Response) => {
  const { data } = req.body;
  if (isEmpty(data)) return res.status(400).send({ code: "empty" });

  try {
    const returnedData = await userModel.find({
      $or: [{ name: { $regex: new RegExp(data, "i") } }, { subjects: { $regex: new RegExp(data, "i") } }],
    });

    for (const obj of returnedData) {
      obj.password = null;
    }

    if (returnedData) return res.status(200).send(returnedData);
    res.status(200).send({ code: "notFound" });
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

router.post("/findById", async (req: Request, res: Response) => {
  const { id: _id } = req.body;
  if (isEmpty(_id)) return res.status(400).send({ code: "empty" });

  try {
    const returnedData = await userModel.findOne({ _id });
    returnedData.password = null;

    if (returnedData) return res.status(200).send(returnedData);
    res.status(200).send({ code: "notFound" });
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

export default router;
