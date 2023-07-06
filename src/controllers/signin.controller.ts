import { ParameterizedContext } from "koa";

// [GET] /signin
export const signInIndex = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    //console.log(ctx.cookies.get(process.env.JWT_COOKIE_NAME || 'jwt', { signed: true }));
    await ctx.render('signin', { title: 'Sign In' });
  } catch (err: any) {
    ctx.throw(err);
  }
};
