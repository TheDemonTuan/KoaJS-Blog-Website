import { Next, ParameterizedContext } from "koa";

// [GET] /
export const homeIndex = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    await ctx.render('home');
  } catch (err: any) {
    ctx.throw(err);
  }
};
