import { ParameterizedContext, Next } from "koa";
import { IAuth, delAuth, verifyAuth } from "../utils/authentication.js";
import { IResponses } from "../utils/responses.js";
import UserModel from '../models/user.model.js';
import { delToken, getToken, setToken } from "../utils/redis.js";
const userModel: UserModel = new UserModel();

const logOut = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    await delAuth(ctx);
    ctx.session.message = {
      type: 'error',
      message: 'Your session has expired, please sign in again.'
    }
    ctx.redirect('/signin');
  } catch (err: any) {
    ctx.throw(err);
  }
};

export default async (ctx: ParameterizedContext, next: Next) => {
  try {
    const authVerify: IResponses<IAuth> = await verifyAuth(ctx);
    if (!authVerify?.success) {
      switch (authVerify?.error_type) {
        case 'not_logged_in':
          return await next();
        case 'token_invalid':
        case 'token_expired':
        case 'token_not_found':
          return await logOut(ctx);
        default:
          ctx.throw('Something went wrong !')
      };
    } else {
      if (!authVerify?.data) {
        return await logOut(ctx);
      };
      //? get token from redis
      let userInfo: IAuth | null = await getToken(authVerify.data.uid, 'info');

      //! if token in redis not found
      if (!userInfo) {
        userInfo = await userModel.findById(authVerify?.data?.uid);
        if (!userInfo) {
          return await logOut(ctx);
        };
        await setToken(authVerify?.data?.uid, 'info', userInfo)
      }

      ctx.state.userInfo = userInfo;
    };
    await next();
  } catch (err: any) {
    ctx.throw(err);
  }
};