import { Next, ParameterizedContext } from "koa";
import Joi, { ObjectSchema, ValidationError } from "joi";
import sendResponse from "../utils/responses.js";

// Logic
const getFirstJoiErrorMessages = (error: ValidationError): string => {
  let errorMessage: string = error.details[0].message.replace(/"/g, '').replace(/[_-]/g, ' ');
  return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);;
}

const isStrongPassword = (password: string): boolean => {
  const strongPasswordRegex: RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
  return strongPasswordRegex.test(password);
}

export const userSignInValidator = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
  try {
    const userSignInValidateSchema: ObjectSchema = Joi.object({
      username: Joi.string()
        .alphanum().message('Username must be alphanumeric characters only.')
        .min(5).message('Username must be at least 5 characters long.')
        .max(20).message('Username must be at most 20 characters long.')
        .trim()
        .required(),
      password: Joi.string()
        .trim()
        .required(),
    });

    let { error, value } = userSignInValidateSchema.validate(ctx.request.body, { abortEarly: true, allowUnknown: true, stripUnknown: true });

    if (error && error.isJoi) {
      return sendResponse(ctx, { success: false, message: getFirstJoiErrorMessages(error) }, 400);
    } else if (!isStrongPassword(value.password)) {
      return sendResponse(ctx, { success: false, message: 'Password is not valid.' }, 400);
    }
    ctx.request.body = value;
    await next();
  } catch (err: any) {
    sendResponse(ctx, { success: false, message: 'Sign in validate error !' }, 500);
  }
};

export const userSignUpValidator = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
  try {
    const userSignUpValidateSchema: ObjectSchema = Joi.object({
      display_name: Joi.string()
        .alphanum().message('Display name must be alphanumeric characters only.')
        .min(5).message('Display name must be at least 5 characters long.')
        .max(20).message('Display name must be at most 20 characters long.')
        .trim()
        .required(),
      email: Joi.string()
        .email().message('Email must be a valid email.')
        .trim()
        .required(),
      username: Joi.string()
        .alphanum().message('Username must be alphanumeric characters only.')
        .min(5).message('Username must be at least 5 characters long.')
        .max(20).message('Username must be at most 20 characters long.')
        .trim()
        .required(),
      password: Joi.string()
        .trim()
        .required(),
      confirm_password: Joi.string()
        .trim()
        .required(),
      agree: Joi.string()
        .trim()
        .required(),
    }).with('password', 'confirm_password');

    let { error, value } = userSignUpValidateSchema.validate(ctx.request.body, { abortEarly: true, allowUnknown: true, stripUnknown: true });

    if (error && error.isJoi) {
      return sendResponse(ctx, { success: false, message: getFirstJoiErrorMessages(error) }, 400);
    } else if (!isStrongPassword(value.password)) {
      return sendResponse(ctx, { success: false, message: 'Password is not strong enough.' }, 400);
    } else if (value.password !== value.confirm_password) {
      return sendResponse(ctx, { success: false, message: 'Confirm password does not match.' }, 400);
    }
    ctx.request.body = value;
    await next();
  } catch (err: any) {
    sendResponse(ctx, { success: false, message: 'Sign up validate error !' }, 500);
  }
};