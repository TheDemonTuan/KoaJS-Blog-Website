import { ParameterizedContext, Next } from "koa";

export default async (ctx: ParameterizedContext, next: Next) => {
  try {
    await next();
    if (ctx.status == 404)
      ctx.throw(404, 'File Not Found');
  } catch (err: any) {
    ctx.status = err.status || 500

    ctx.state.error_code = ctx.status;
    const error_message = process.env.NODE_ENV == 'development' ? err.message : 'Internal Server Error';
    ctx.state.error_message = error_message;

    await ctx.render('handler/error', { title: error_message })
  }
};