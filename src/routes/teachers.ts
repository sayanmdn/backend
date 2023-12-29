import { Request, Response, Router } from "express";
import userModel, { IUser } from "../models/User";
import { isEmpty } from "lodash";
import jwt from "jsonwebtoken";
import { TEACHER_USER_ROLE } from "../constant";

const router = Router();

// seacrhes for the teachers with the given name or subject
router.post("/find", async (req: Request, res: Response) => {
  const { data } = req.body;

  // check if data is received
  if (isEmpty(data)) return res.status(400).send({ code: "empty" });

  // return all the users whole have role = TEACHER_USER_ROLE and name or subject matches the given data
  try {
    const returnedData = await userModel.find({
      $and: [
        {
          $or: [{ name: { $regex: new RegExp(data, "i") } }, { subjects: { $regex: new RegExp(data, "i") } }],
        },
        { role: TEACHER_USER_ROLE },
      ],
    });

    // remove password and phone from the returned data
    for (const obj of returnedData) {
      obj.password = null;
      obj.phone = null;
    }

    // return the data
    if (returnedData) return res.status(200).send(returnedData);

    // if no data is found
    res.status(200).send({ code: "notFound" });
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

// searches for the teacher with the given id
router.post("/findById", async (req: Request, res: Response) => {
  const { id: _id } = req.body as { id: string };
  const { authorization: token } = req.headers as { authorization: string | undefined };

  // check if id is received
  if (isEmpty(_id)) return res.status(400).send({ code: "empty" });

  // return the user with the given id
  try {
    // fetch the user with the given id
    const returnedData = (await userModel.findOne({ _id })) as IUser | null;

    if (!returnedData) return res.status(400).send({ code: "notFound" });

    // remove password from the returned data
    returnedData.password = null;

    // increment the profileViews by 1
    await userModel.updateOne({ _id: returnedData._id }, { $inc: { profileViews: 1 } });

    // check if token is received and valid
    if (token) {
      try {
        jwt.verify(token, process.env.SECRET_JWT_TOKEN);

        // return the data with phone
        return res.status(200).send(returnedData);
      } catch (_err) {}
    }

    // delete the phone from the returned data
    returnedData.phone = null;

    // return the data
    return res.status(200).send(returnedData);
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

// return all the users whole have role = TEACHER_USER_ROLE in a paginated way
router.post("/list", async (req: Request, res: Response) => {
  const { authorization: token } = req.headers;
  const { page, limit } = req.body;

  // check if token is received
  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  // check if token is valid
  try {
    jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
  }

  // check if page and limit is received
  if (isEmpty(page) || isEmpty(limit)) return res.status(400).send({ code: "empty" });

  // return all the users whole have role = TEACHER_USER_ROLE in a paginated way
  try {
    const returnedData = await userModel
      .find({ role: TEACHER_USER_ROLE })
      .skip(page * limit)
      .limit(limit);

    // remove password and phone from the returned data
    for (const obj of returnedData) {
      obj.password = null;
      obj.phone = null;
    }

    // return the data
    if (returnedData) return res.status(200).send(returnedData);

    // if no data is found
    res.status(200).send({ code: "notFound" });
  } catch (err) {
    res.status(400).send("Error" + err);
  }
});

export default router;
