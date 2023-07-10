import { Next, ParameterizedContext } from "koa";

interface IMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

declare module "koa" {
  interface BaseContext {
    session: {
      [key: string]: any;
      message?: IMessage;
    };
  }
}

export default (ctx: ParameterizedContext, next: Next) => {
  if (ctx.session?.message && ctx.method === 'GET') {
    ctx.state.toast = ctx.session.message;
    delete ctx.session.message
  };
  return next();
}