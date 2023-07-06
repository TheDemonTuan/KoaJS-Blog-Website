import { ParameterizedContext } from "koa";

// [GET] /signin
export const signUpIndex = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    await ctx.render('signup', { title: 'Sign Up' });
  } catch (err: any) {
    ctx.throw(err);
  }
};
