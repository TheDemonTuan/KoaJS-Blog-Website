import { Next, ParameterizedContext } from "koa";
import recaptchaVerify, { RecaptchaData } from '../utils/recaptcha'
import sendResponse, { IResponses } from "../utils/responses";

/**
 * Verify recaptcha v2
 * @param ctx
 * @param next
 * @returns
 * @description This middleware will verify recaptcha v2
 * @description If recaptcha is not valid, it will return 400 status code
 * @description If recaptcha is valid, it will call next middleware
 */
export const recaptchaV2Verify = async (ctx: ParameterizedContext, next: Next) => {
  const recaptchaData: RecaptchaData = {
    version: 2,
    response: ctx.request.body['g-recaptcha-response'],
    secret: process.env.RECAPTCHA_V2_SECRET_KEY || '',
  };
  const result: IResponses = await recaptchaVerify(recaptchaData);
  if (!result.success) {
    delete result.data;
    return sendResponse(ctx, result, 400);
  }
  await next();
};

/**
 * Verify recaptcha v3
 * @param ctx
 * @param next
 * @returns
 * @description This middleware will verify recaptcha v3
 * @description If recaptcha is not valid, it will return 400 status code
 * @description If recaptcha is valid, it will call next middleware
 * @description If recaptcha score is less than 0.5, it will return 400 status code
 * @description If recaptcha score is greater than or equal to 0.5, it will call next middleware
*/
export const recaptchaV3Verify = async (ctx: ParameterizedContext, next: Next) => {
  const recaptchaData: RecaptchaData = {
    version: 3,
    response: ctx.request.body['_grecaptcha'],
    secret: process.env.RECAPTCHA_V3_SECRET_KEY || '',
  };
  const result: IResponses = await recaptchaVerify(recaptchaData);
  if (!result.success) {
    return sendResponse(ctx, result, 400);
  }
  await next();
};