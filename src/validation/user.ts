import Joi from "joi";

// Signup Validation
const signupValidationSchema = Joi.object({
  role: Joi.string(),
  name: Joi.string().min(8).required(),
  email: Joi.string().min(8).email(),
  phone: Joi.string().length(10),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
  subjects: Joi.array().items(
    Joi.object({
      subject: Joi.string().min(2).required(),
      selectedFromRange: Joi.number().required(),
      selectedToRange: Joi.number().required(),
    }),
  ),
});

const checkSignup = (body: any) => {
  return signupValidationSchema.validate(body);
};

// Login Validation
const loginValidationSchema = Joi.object({
  email: Joi.string().min(8).required().email(),
  password: Joi.string().min(8).required(),
});

const checkLogin = (body: any) => {
  return loginValidationSchema.validate(body);
};

// Email Validation
const emailValidationSchema = Joi.object({
  email: Joi.string().min(8).required().email(),
});

// Phone number validation
const phoneValidationSchema = Joi.object({
  phone: Joi.string().length(10).required(),
  role: Joi.string(),
});

const checkPhone = (body: any) => {
  return phoneValidationSchema.validate(body);
};

const checkEmail = (body: any) => {
  return emailValidationSchema.validate(body);
};

export { checkSignup, checkLogin, checkEmail, checkPhone };
