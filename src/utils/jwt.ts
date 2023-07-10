import * as jose from 'jose'
import fs from 'fs'
import path from "path";
import { IResponses } from './responses.js';
import { ParameterizedContext } from 'koa';

const alg = 'PS512'

export const createJwt = async (data: jose.JWTPayload): Promise<IResponses<string>> => {
  try {
    const jwkPrivate = await JSON.parse(fs.readFileSync(path.resolve(__dirname, 'keys/private.key'), 'utf8'));
    const privateKey = await jose.importJWK(jwkPrivate, alg)
    const jwt = await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .setExpirationTime('1d')
      .sign(privateKey)
    return { success: true, message: 'Create jwt successfully.', data: jwt };
  } catch (err: any) {
    return { success: false, message: 'Cant create jwt, please try again later.' };
  }
}

export const verifyJwt = async (jwt: string): Promise<IResponses<jose.JWTPayload>> => {
  try {
    const jwkPublic = await JSON.parse(fs.readFileSync(path.resolve(__dirname, 'keys/public.key'), 'utf8'));
    const publicKey = await jose.importJWK(jwkPublic, alg)
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
      issuer: 'TheDemonTuan',
      audience: 'authenticator',
    });
    return { success: true, message: 'Verify jwt successfully.', data: payload };
  } catch (err: any) {
    return { success: false, message: 'Cant verify jwt, please try again later.' };
  }
}

export const setJwtCookie = async (ctx: ParameterizedContext, jwt: string): Promise<void> => {
  ctx.cookies.set(process.env.JWT_COOKIE_NAME || 'jwt', jwt, { httpOnly: true, sameSite: "lax", secure: false, signed: true, maxAge: 86400000, overwrite: true });
}