import express from "express";
import userModel from "../models/User";
import dataModel from "../models/Data";
import otpModel from "../models/OTP";
import NewsModel from "../models/News";
import getMessageHTML from "../assets/otpEmail";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import * as userValidation from "../validation/user";
import NewsAPI from "newsapi";
import OpenAI from "openai";

const newsapi = new NewsAPI("8c4fe58fb02945eb9469d8859addd041");

aws.config.update({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
  region: "ap-southeast-1",
});
const ses = new aws.SES({ apiVersion: "2010-12-01" });

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  console.log(req.body);

  // VALIDATION
  const { error } = userValidation.checkSignup(req.body);
  if (error != null) {
    console.log("validation log: " + error);
    return res.send({
      code: "validationFalse",
      message: error.details[0].message,
    });
  }

  // Check OTP
  const otpFromDB = await otpModel.find({ email: req.body.email });
  console.log("OTP From DB : " + otpFromDB);
  if (otpFromDB[otpFromDB.length - 1].otp !== req.body.otp) return res.send("OTP did not match");

  // CHECKING IF EMAIL ALREADY EXISTS
  const emailExist = await userModel.findOne({ email: req.body.email });
  console.log("Email exists log: " + emailExist);
  if (emailExist) return res.status(400).send("Email already exists");

  // HASH PASSWORDS
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // ADD USER
  const user = new userModel({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const saveUser = await user.save();
    console.log("Signup success log: " + saveUser);
    res.send({
      code: "userCreated",
      message: {
        id: saveUser._id,
        name: saveUser.name,
      },
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  // VALIDATION
  const { error } = userValidation.checkLogin(req.body);
  if (error != null) {
    return res.status(400).send({ code: "validationFalse", message: error.details[0].message });
  }

  console.log("req.body ", req.body);

  const userEmail = req.body.email;

  let userByEmail: { _id: string; password: string; name: string } | undefined = undefined;

  // CHECKING IS EMAIL ALREADY EXISTS
  try {
    userByEmail = await userModel.findOne({ email: userEmail });
  } catch (e) {
    console.log("Error fetching from DB", e);
  }

  if (!userByEmail) return res.status(400).send("Email does not exist");

  // HASH PASSWORDS
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // VALID PASSWORD
  const validPass = await bcrypt.compare(req.body.password, userByEmail.password);
  if (!validPass) return res.status(400).send("Invalid password");

  // SEND JWT LOGIN TOKENS
  const token = jwt.sign({ id: userByEmail._id, name: userByEmail.name }, process.env.SECRET_JWT_TOKEN);
  return res.header("auth-token", token).send({
    code: "Loggedin",
    token: token,
    user: { id: userByEmail._id, name: userByEmail.name },
    //flag22
  });

  // res.send('Logged in!!!')
});

router.post("/save", async (req: Request, res: Response) => {
  console.log(req.body);

  // VERIFY TOKEN
  let token = req.body.token;

  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  try {
    const verified = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
    console.log("verified log: " + JSON.stringify(verified));

    var givenUserId = verified.id;
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
    return;
  }

  // ADD DATA
  const data = new dataModel({
    userId: givenUserId,
    data: req.body.data,
  });
  try {
    const savedData = await data.save();
    console.log("Data save success log: " + savedData);
    res.send({
      code: "dataSaved",
      message: {
        id: savedData._id,
        // data: savedData.data
      },
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

router.post("/getdata", async (req: Request, res: Response) => {
  const token = req.body.token;
  // console.log(req)
  // console.log("information log ");
  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  try {
    const verified = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
    console.log("verified log: " + JSON.stringify(verified));
    console.log("verified log: " + JSON.stringify(verified));

    let givenUserId = verified.id;
    const returnedData = await dataModel.find({ userId: givenUserId });
    // console.log('Email exists log: '+ returnedData)
    if (returnedData) return res.status(200).send(returnedData);
    res.status(200).send({ code: "dataNotFound", message: returnedData });
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
  }
});

router.post("/otpsend", async (req: Request, res: Response) => {
  console.log(req.body);

  // VALIDATION
  const { error } = userValidation.checkEmail(req.body);
  if (error != null) {
    console.log("OTP service email validation log: " + error);
    return res.send({
      code: "validationFalse",
      message: error.details[0].message,
    });
  }

  const rand = Math.floor(100000 + Math.random() * 900000);

  // ADD OTP Model
  const otp = new otpModel({
    email: req.body.email,
    otp: rand.toString(),
  });

  console.log("New otp generated is " + rand);

  const params = {
    Destination: {
      ToAddresses: [req.body.email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: getMessageHTML(rand.toString()),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Your OTP is here",
      },
    },
    Source: "info@mail.sayantanmishra.com",
  };

  const sendEmail = ses.sendEmail(params).promise();

  try {
    await sendEmail;
    console.log("email submitted to SES");
  } catch (error) {
    console.log(error);
  }

  // OTP save to DB
  try {
    const savedOtp = await otp.save();
    console.log("otpsend success log: " + savedOtp);
    res.send({
      code: "otpSent",
      message: {
        id: savedOtp._id,
        email: savedOtp.email,
      },
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

router.get("/news", async (req: Request, res: Response) => {
  // check if present in DB
  const returnedData = await NewsModel.find({ time: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
  if (returnedData.length > 0) {
    res.send(returnedData[0].data);
    return;
  }

  // fetch the news api
  const result = await newsapi.v2.topHeadlines({
    category: "business",
    language: "en",
    country: "in",
  });

  // console.log(result);
  const descriptions = result.articles.map((e) => e.description) as string[];

  // get curated data form openai
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt: string = `Summarize the following news article descriptions in a better way and combine them in a single paragraph then devide them in bullet points.
    Add more context to the points and also add the probable circumstance or impact for this in the same point itself.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt + " \n".concat(descriptions.join("\n ")),
      },
    ],
    model: "gpt-3.5-turbo-16k-0613", // gpt-3.5-turbo-16k-0613  gpt-3.5-turbo
  });

  // store data in Mongo DB
  const data = new NewsModel({
    data: chatCompletion.choices[0].message.content,
  });
  await data.save();

  // send the generated data
  res.send(chatCompletion.choices[0].message.content);
});

export default router;
