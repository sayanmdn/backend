import Joi from 'joi';

// Signup Validation
const signupValidationSchema = Joi.object({
  name: Joi.string().min(8).required(),
  email: Joi.string().min(8).required().email(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
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

const checkEmail = (body: any) => {
  return emailValidationSchema.validate(body);
};

export { checkSignup, checkLogin, checkEmail };
