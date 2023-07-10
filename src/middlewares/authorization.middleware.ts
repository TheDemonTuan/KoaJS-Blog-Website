import { Next, ParameterizedContext } from "koa";

export const needLogged = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
  if (!ctx.state.userInfo) {
    ctx.session.message = {
      type: 'error',
      message: 'You need to signin to access this page.'
    };
    ctx.redirect('/signin');
  } else {
    await next();
  }
};

export const isLogged = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
  if (ctx.state.userInfo) {
    ctx.session.message = {
      type: 'error',
      message: 'You are already logged in.'
    };
    ctx.redirect('/');
  } else {
    await next();
  }
};