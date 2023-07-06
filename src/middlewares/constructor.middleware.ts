import { ParameterizedContext, Next } from "koa";

export default async (ctx: ParameterizedContext, next: Next) => {
  try {
    ctx.state = {
      paths: ctx.URL.pathname.split('/').filter(path => path !== ''),
    };
    await next();
  } catch (err: any) {
    ctx.throw(err);
  }
};