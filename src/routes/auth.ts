import express from "express";
import userModel from "../models/User";
import dataModel from "../models/Data";
import otpModel from "../models/OTP";
import NewsModel from "../models/News";
import getMessageHTML from "../assets/otpEmail";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as userValidation from "../validation/user";
import NewsAPI from "newsapi";
import OpenAI from "openai";
import { isEmpty, toUpper } from "lodash";
import { STUDENT_USER_ROLE, TEACHER_USER_ROLE } from "../constant";
import workosService from "../services/workos";

const newsapi = new NewsAPI("8c4fe58fb02945eb9469d8859addd041");

const router = express.Router();

interface OriginalFormat {
  subject: string;
  selectedFromRange: number;
  selectedToRange: number;
}

interface DesiredFormat {
  subject: string;
  fromClass: number;
  toClass: number;
}

const serializeFunction = (inputArray: OriginalFormat[]): DesiredFormat[] => {
  return inputArray.map(({ subject, selectedFromRange, selectedToRange }) => ({
    subject,
    fromClass: selectedFromRange,
    toClass: selectedToRange,
  }));
};

router.post("/signup", async (req: Request, res: Response) => {
  const { error } = userValidation.checkSignup(req.body);
  if (error != null) {
    return res.send({
      code: "validationFalse",
      message: error.details[0].message,
    });
  }

  if (req.body.role === "TEACHER") {
    // Check OTP
    const otpFromDB = await otpModel.find({ email: req.body.phone });
    if (otpFromDB[otpFromDB.length - 1].otp !== req.body.otp) return res.send("OTP did not match");

    if (req.body.phone) {
      const phoneExist = await userModel.findOne({ phone: req.body.phone });
      if (phoneExist) return res.status(400).send("Phone number already exists");
    } else {
      return res.status(400).send("field 'phone' is missing");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new userModel({
      name: req.body.name,
      role: req.body.role,
      email: req.body.email || undefined,
      password: hashedPassword,
      phone: req.body.phone || undefined,
      subjects: req.body.subjects.map((element) => toUpper(element.subject.trim())) || undefined,
      subjectClasses: serializeFunction(req.body.subjects) || undefined,
      college: req.body.college || undefined,
      subjectEnrolled: req.body.subjectEnrolled || undefined,
      degreeEnrolled: req.body.degreeEnrolled || undefined,
    });
    try {
      const saveUser = await user.save();
      res.send({
        code: "userCreated",
        message: {
          id: saveUser._id,
          name: saveUser.name,
        },
      });
    } catch (err) {
      res.status(400).send(err);
    }
    return;
  }

  // Check OTP
  const otpFromDB = await otpModel.find({ email: req.body.email });
  if (otpFromDB[otpFromDB.length - 1].otp !== req.body.otp) return res.send("OTP did not match");

  if (!isEmpty(req.body.email)) {
    const emailExist = await userModel.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("Email already exists");
  } else {
    return res.status(400).send("Email is required");
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new userModel({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone || undefined,
  });
  try {
    const saveUser = await user.save();
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
  const { error } = userValidation.checkLogin(req.body);
  if (error != null) {
    return res.status(400).send({ code: "validationFalse", message: error.details[0].message });
  }

  const userEmail = req.body.email;

  let userByEmail: { _id: string; password: string; name: string; role?: string; isSSO?: boolean } | undefined = undefined;

  // check if email already exists
  try {
    userByEmail = await userModel.findOne({ email: userEmail });
  } catch (e) {
    console.log("Error fetching from DB", e);
  }

  if (!userByEmail) return res.status(400).send("Email does not exist");

  // Check if user is SSO user
  if (userByEmail.isSSO) {
    return res.status(400).json({
      code: "ssoUserError",
      message: "This account uses SSO authentication. Please use SSO login.",
    });
  }

  const validPass = await bcrypt.compare(req.body.password, userByEmail.password);
  if (!validPass) return res.status(400).send("Invalid password");

  const token = jwt.sign(
    { id: userByEmail._id, name: userByEmail.name, role: userByEmail.role || "USER" },
    process.env.SECRET_JWT_TOKEN,
  );

  return res.header("auth-token", token).send({
    code: "Loggedin",
    token: token,
    user: { id: userByEmail._id, name: userByEmail.name, role: userByEmail.role || "USER" },
  });
});

router.post("/save", async (req: Request, res: Response) => {
  let { token } = req.body;

  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  try {
    const verified = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };

    var givenUserId = verified.id;
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
    return;
  }

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
      },
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

router.post("/getdata", async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  try {
    const { id } = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };

    const returnedData = await dataModel.find({ userId: id });

    if (returnedData) return res.status(200).send(returnedData);
    res.status(200).send({ code: "dataNotFound", message: returnedData });
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
  }
});

router.post("/otpsend", async (req: Request, res: Response) => {
  try {
    if (req.body.role === TEACHER_USER_ROLE || req.body.role === STUDENT_USER_ROLE) {
      const { error } = userValidation.checkPhone(req.body);
      if (error != null) {
        console.log("OTP service email validation log: " + error);
        return res.send({
          code: "validationFalse",
          message: error.details[0].message,
        });
      }

      const rand = Math.floor(100000 + Math.random() * 900000);

      // Create SNS client
      const snsClient = new SNSClient({
        region: "ap-south-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESSKEY!,
          secretAccessKey: process.env.AWS_SECRET_ACCESSKEY!,
        },
      });

      const processedNumber = req.body.phone.length === 10 ? "+91".concat(req.body.phone) : req.body.phone;

      // Define the message parameters
      const publishCommand = new PublishCommand({
        Message: "Hello, You OTP for FindMyTeahcer is " + rand,
        PhoneNumber: processedNumber, // Recipient's phone number
      });

      // Send the SMS
      try {
        const data = await snsClient.send(publishCommand);
        console.log("SMS sent successfully:", { PhoneNumber: processedNumber, MessageId: data.MessageId });
      } catch (err) {
        console.error("Error sending SMS:", err);
        return res.status(400).send(err);
      }

      // save OTP in DB
      const otp = new otpModel({
        email: req.body.phone,
        otp: rand.toString(),
      });

      try {
        const savedOtp = await otp.save();
        res.send({
          code: "otpSent",
          message: {
            id: savedOtp._id,
            email: savedOtp.email,
          },
        });
      } catch (err) {
        res.status(400).send(err);
      }

      return;
    }

    // Email OTP Send
    const { error } = userValidation.checkEmail(req.body);
    if (error != null) {
      return res.send({
        code: "validationFalse",
        message: error.details[0].message,
      });
    }

    const rand = Math.floor(100000 + Math.random() * 900000);

    // save OTP in DB
    const otp = new otpModel({
      email: req.body.email,
      otp: rand.toString(),
    });

    // Create SES client
    const sesClient = new SESClient({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESSKEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESSKEY!,
      },
    });

    const sendEmailCommand = new SendEmailCommand({
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
    });

    try {
      const result = await sesClient.send(sendEmailCommand);
      console.log("Email sent successfully:", { MessageId: result.MessageId });
    } catch (error) {
      console.log(error);
    }

    // OTP save to DB
    try {
      const savedOtp = await otp.save();
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
  } catch (err) {
    console.log("Error in OTP send: " + JSON.stringify(err));
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
    Add more context to the points and also add the probable circumstance or impact for this in the same point itself. example: '- first point.- second point.- third point.`;

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

router.post("/write", async (req: Request, res: Response) => {
  const { text } = req.body;
  const { authorization: token } = req.headers;
  if (!token) return res.status(400).send({ code: "tokenNotReceived", message: token });

  try {
    const { id: userId } = jwt.verify(token, process.env.SECRET_JWT_TOKEN) as { id: string };
    const user = await userModel.find({ userId });
  } catch (err) {
    res.status(400).send("tokenInvalid" + err);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt: string = `Write this in a better way. '${text}`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo", // gpt-3.5-turbo-16k-0613  gpt-3.5-turbo
    });

    // send the generated data
    res.send({ response: chatCompletion.choices[0].message.content });
  } catch (e) {
    res.status(400).send("Unable to process the request.");
  }
});

// SSO Routes
router.get("/sso/authorize", async (req: Request, res: Response) => {
  try {
    const { state, redirect_uri, provider, domain, organization, connection } = req.query;
    
    const authorizationURL = workosService.getAuthorizationURL({
      state: state as string,
      redirectUri: redirect_uri as string,
      provider: provider as string,
      domain: domain as string,
      organization: organization as string,
      connection: connection as string,
    });

    res.json({
      code: "authorizationURL",
      authorizationURL,
      url: authorizationURL,
      redirectUrl: authorizationURL,
      success: true,
    });
  } catch (error) {
    console.error("SSO authorization error:", error);
    res.status(500).json({
      code: "ssoError",
      message: "Failed to generate authorization URL",
    });
  }
});

// POST callback route for frontend to send authorization code
router.post("/sso/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({
        code: "missingCode",
        message: "Authorization code is required",
      });
    }

    const authResult = await workosService.authenticateWithCode(code, redirect_uri);

    if (!authResult.success) {
      return res.status(400).json({
        code: "authenticationFailed",
        message: authResult.error,
      });
    }

    const { profile } = authResult;

    // Check if user exists
    let user = await userModel.findOne({ 
      $or: [
        { workosId: profile.id },
        { email: profile.email }
      ]
    });

    if (!user) {
      // Create new SSO user
      user = new userModel({
        name: profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}` 
          : profile.email.split("@")[0],
        email: profile.email,
        password: "", // No password for SSO users
        workosId: profile.id,
        organizationId: profile.organizationId,
        connectionId: profile.connectionId,
        authProvider: profile.connectionType,
        isSSO: true,
        role: "USER", // Default role for SSO users
      });

      await user.save();
    } else if (!user.isSSO) {
      // Update existing non-SSO user to SSO
      user.workosId = profile.id;
      user.organizationId = profile.organizationId;
      user.connectionId = profile.connectionId;
      user.authProvider = profile.connectionType;
      user.isSSO = true;
      
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        role: user.role || "USER",
        isSSO: true
      },
      process.env.SECRET_JWT_TOKEN!,
    );

    res.json({
      code: "ssoLoginSuccess",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "USER",
        isSSO: true,
        organization: profile.organizationId,
        authProvider: profile.connectionType,
      },
    });
  } catch (error) {
    console.error("SSO callback error:", error);
    res.status(500).json({
      code: "ssoCallbackError",
      message: "Failed to process SSO callback",
    });
  }
});

router.get("/sso/profile", async (req: Request, res: Response) => {
  try {
    const { authorization: token } = req.headers;

    if (!token) {
      return res.status(401).json({
        code: "tokenNotReceived",
        message: "Authorization token is required",
      });
    }

    const { id: userId } = jwt.verify(token, process.env.SECRET_JWT_TOKEN!) as { id: string };
    
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: "userNotFound",
        message: "User not found",
      });
    }

    res.json({
      code: "profileRetrieved",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "USER",
        isSSO: user.isSSO,
        organization: user.organizationId,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("SSO profile error:", error);
    res.status(500).json({
      code: "profileError",
      message: "Failed to retrieve profile",
    });
  }
});

router.get("/sso/connections", async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.query;

    const connectionsResult = await workosService.listConnections(organization_id as string);

    if (!connectionsResult.success) {
      return res.status(400).json({
        code: "connectionsError",
        message: connectionsResult.error,
      });
    }

    res.json({
      code: "connectionsRetrieved",
      connections: connectionsResult.connections,
    });
  } catch (error) {
    console.error("SSO connections error:", error);
    res.status(500).json({
      code: "connectionsError",
      message: "Failed to retrieve connections",
    });
  }
});

export default router;
