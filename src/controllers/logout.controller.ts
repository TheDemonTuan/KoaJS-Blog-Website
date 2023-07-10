import { ParameterizedContext } from "koa";
import { delAuth } from "../utils/authentication.js";
import { delToken } from "../utils/redis.js";

// [GET] /logout
export const logOutIndex = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    await delAuth(ctx);
    ctx.session.message = {
      type: 'success',
      message: 'Logout successfully.'
    }
    ctx.redirect('/signin');
  } catch (err: any) {
    ctx.throw(err);
  }
};