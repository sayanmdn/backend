import express from "express";
import userModel from "../models/User";
import { isEmpty } from "lodash";

import { Request, Response } from "express";
import { TEACHER_USER_ROLE } from "../constant";

const router = express.Router();

router.post("/find", async (req: Request, res: Response) => {
  const { data } = req.body;
  if (isEmpty(data)) return res.status(400).send({ code: "empty" });

  try {
    const returnedData = await userModel.find({
      $and: [
        {
          $or: [{ name: { $regex: new RegExp(data, "i") } }, { subjects: { $regex: new RegExp(data, "i") } }],
        },
        { role: TEACHER_USER_ROLE },
      ],
    });

    for (const obj of returnedData) {
      obj.password = null;
      obj.phone = null;
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

    await userModel.updateOne({ _id: returnedData._id }, { $inc: { profileViews: 1 } });

    if (returnedData) return res.status(200).send(returnedData);
    res.status(200).send({ code: "notFound" });
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

export default router;
