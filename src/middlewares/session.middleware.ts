import { ParameterizedContext, Next, BaseContext } from "koa";
import crypto from 'crypto';
import { setSession, getSession, delSession, setSessionExpire } from "../utils/redis.js";

const setSessionCookie = async (ctx: ParameterizedContext): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (Object.keys(ctx.session)?.length > 0) {
        const sessionId = Buffer.from(crypto.randomBytes(24)).toString('base64url');
        ctx.cookies.set(process.env.SESSION_COOKIE_NAME || 's', sessionId, { httpOnly: true, sameSite: "strict", secure: false, signed: true, maxAge: 3600000, overwrite: true })
        await setSession(sessionId, ctx.session);
        await setSessionExpire(sessionId, 3600);
        resolve(true);
      }
      else
        resolve(false);
    } catch (err: any) {
      reject(err);
    }
  });
}

export default async (ctx: ParameterizedContext, next: Next) => {
  try {
    const sid: string | undefined = ctx.cookies.get(process.env.SESSION_COOKIE_NAME || 's', { signed: true });
    if (sid) {
      const sessionData = await getSession(sid);
      ctx.session = {};
      if (sessionData) {
        ctx.session = Object.assign(ctx.session, sessionData);
      } else {
        ctx.cookies.set(process.env.SESSION_COOKIE_NAME || 's', '', { httpOnly: true, sameSite: "strict", secure: false, signed: true, maxAge: 0, overwrite: true })
        return await next();
      };
      //! First middleware
      await next();
      //! Last middleware
      const nowSessionData = JSON.stringify(ctx.session);
      const oldSessionData = JSON.stringify(sessionData);

      if (nowSessionData !== oldSessionData) {
        await setSession(sid, ctx.session);
      };
    } else {
      //! First middleware
      ctx.session = {};
      await next();
      //! Last middleware
      await setSessionCookie(ctx);
    }
  } catch (err: any) {
    ctx.throw(err);
  }
};