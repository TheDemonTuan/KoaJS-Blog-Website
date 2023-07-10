import crypto from 'crypto';
import { ParameterizedContext } from 'koa';
import { IResponses } from './responses.js';
import { delToken, getToken, setTokenExpire, setToken } from './redis.js';

export interface IAuth {
  readonly tid: string;
  readonly uid: string;
  expired: number;
}

export interface IToken {
  [key: string]: any;
};

export interface ITokenInfo {
  readonly iv: string;
  readonly tid: string;
  readonly uid: string;
}

export const encryptWithAES256 = async (data: IAuth): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const iv = Buffer.from(crypto.randomBytes(16));
      const cipher = crypto.createCipheriv('aes-256-cbc', process.env.AUTH_SECRET_KEY ?? '', iv);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64url');
      encrypted += cipher.final('base64url');
      resolve({
        iv: iv.toString('base64url'),
        encrypted: encrypted
      })
    } catch (err: any) {
      reject(err);
    }
  });
}

export const decryptWithAES256 = async (tokenEncrypted: string, iv: string): Promise<IAuth | null> => {
  return new Promise((resolve, reject) => {
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.AUTH_SECRET_KEY ?? '', Buffer.from(iv, 'base64url'));
      let decrypted = decipher.update(tokenEncrypted, 'base64url', 'utf8');
      decrypted += decipher.final('utf8');
      resolve(JSON.parse(decrypted));
    } catch (err: any) {
      resolve(null);
    }
  });
}

export const getAuthInfo = async (ctx: ParameterizedContext): Promise<IResponses<ITokenInfo>> => {
  try {
    const infoCookie = ctx.cookies.get(process.env.AUTH_UID_TID_COOKIE_NAME ?? 'u', { signed: true });
    if (!infoCookie) {
      return {
        success: false,
        message: 'Not logged in !',
        error_type: 'not_logged_in'
      };
    } else {
      //TODO Split info cookie
      //? info cookie format: iv.uid.tid
      let splitInfo = infoCookie.split('.');

      if (splitInfo?.length !== 3) {
        return {
          success: false,
          message: 'Token invalid !',
          error_type: 'token_invalid'
        };
      };

      return {
        success: true,
        message: 'Get token info successfully !',
        data: {
          iv: splitInfo[0],
          uid: splitInfo[1],
          tid: splitInfo[2]
        },
      };
    }

  } catch (err: any) {
    ctx.throw(err);
  }
}

export const verifyAuth = async (ctx: ParameterizedContext): Promise<IResponses<IAuth>> => {
  try {
    const authCookieSigned = ctx.cookies.get(process.env.AUTH_COOKIE_NAME ?? 't', { signed: true });

    //TODO Check if user is logged in
    if (!authCookieSigned) {
      return {
        success: false,
        message: 'Not logged in !',
        error_type: 'not_logged_in'
      };
    }

    //TODO Split auth cookie
    //? auth cookie format: token.iv.uid.tid
    let authInfoData: IResponses<ITokenInfo> = await getAuthInfo(ctx);

    if (!authInfoData?.success) {
      return {
        success: authInfoData.success,
        message: authInfoData.message,
        error_type: authInfoData.error_type
      };
    } else if (!authInfoData?.data || !authInfoData?.data?.iv || !authInfoData?.data?.uid || !authInfoData?.data?.tid) {
      return {
        success: false,
        message: 'Token invalid !',
        error_type: 'token_invalid'
      };
    }

    //TODO Decrypt token in cookie
    const result: IAuth | null = await decryptWithAES256(authCookieSigned, authInfoData?.data?.iv ?? '');

    //TODO Cookie validation
    //! if some data is missing
    if (!result || !result?.tid || !result?.uid || !result?.expired) {
      //* return error
      return {
        success: false,
        message: 'Token invalid !',
        error_type: 'token_invalid'
      };
      //! if token in cookie expired
    } else if (authInfoData?.data?.uid !== result?.uid || authInfoData?.data?.tid !== result?.tid) {
      //* delete token in redis
      await delToken(result?.uid, result?.tid);
      //* return error
      return {
        success: false,
        message: 'Token invalid !',
        error_type: 'token_invalid'
      };
      //! if token in cookie expired
    } else if (result?.expired < Date.now()) {
      //* delete token in redis
      await delToken(result?.uid, result?.tid);
      //* return error
      return {
        success: false,
        message: 'Token Expired',
        error_type: 'token_expired'
      };
      //TODO DB validation
    } else {
      //* get token from redis
      let tokenData = await getToken(result?.uid, result?.tid);

      //! if token in redis not found
      if (!tokenData) {
        //* return error
        return {
          success: false,
          message: 'Token not found !',
          error_type: 'token_not_found'
        };
        //? if get token in redis success
      } else {
        //! if some data is missing
        if (!tokenData?.uid || !tokenData?.tid || !tokenData?.expired) {
          //* delete token in redis
          await delToken(result?.uid, result?.tid);
          //* return error
          return {
            success: false,
            message: 'Token invalid !',
            error_type: 'token_invalid'
          };
        } else if (tokenData?.expired < Date.now()) {
          //* delete token in redis
          await delToken(result?.uid, result?.tid);
          //* return error
          return {
            success: false,
            message: 'Token expired !',
            error_type: 'token_expired'
          };
          //! if token uid or token tid in redis not match
        } else if (tokenData?.uid !== result?.uid || tokenData.tid !== result?.tid) {
          //* delete token in redis
          await delToken(result?.uid, result?.tid);
          //* return error
          return {
            success: false,
            message: 'Token invalid !',
            error_type: 'token_invalid'
          };
        };
      };
      //? if all check success
      return {
        success: true,
        message: 'Logged in',
        data: result
      };
    };
  }
  catch (err: any) {
    ctx.throw(err);
  };
};

export const setAuth = async (ctx: ParameterizedContext, uid: string, expired: number): Promise<IAuth> => {
  return new Promise(async (resolve, reject) => {
    try {
      //TODO Convert expired to millisecond
      expired *= 1000;

      //TODO Generate token
      const tid: string = Buffer.from(crypto.randomBytes(24)).toString('base64url');

      //TODO Create token data
      const tokenData: IAuth = {
        tid,
        uid,
        expired: Date.now() + expired,
      };

      //TODO Encrypt token data
      const encryptTokenData = await encryptWithAES256(tokenData);

      //TODO Set token to cookie
      ctx.cookies.set(process.env.AUTH_COOKIE_NAME ?? 't', encryptTokenData?.encrypted, { httpOnly: true, sameSite: "lax", secure: false, signed: true, maxAge: expired, overwrite: true });
      ctx.cookies.set(process.env.AUTH_UID_TID_COOKIE_NAME ?? 'u', `${encryptTokenData?.iv}.${uid}.${tid}`, { httpOnly: false, sameSite: "strict", secure: false, signed: true, maxAge: expired, overwrite: true });

      //TODO Set token to redis
      await setToken(uid, tid, tokenData);
      await setTokenExpire(uid, expired / 1000);

      //TODO Return token data
      resolve(tokenData);
    } catch (err: any) {
      reject(err);
    }
  });
}

export const delAuth = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    const authInfoData: IResponses<ITokenInfo> = await getAuthInfo(ctx);
    if (!authInfoData?.success) {
      ctx.throw(400, authInfoData);
    } else if (!authInfoData?.data || !authInfoData?.data?.iv || !authInfoData?.data?.uid || !authInfoData?.data?.tid) {
      ctx.throw(400, authInfoData);
    }
    await delToken(authInfoData?.data.uid, authInfoData?.data.tid);
    ctx.cookies.set(process.env.AUTH_COOKIE_NAME ?? 't', '', { httpOnly: true, sameSite: "lax", secure: false, signed: true, maxAge: 0, overwrite: true });
    ctx.cookies.set(process.env.AUTH_UID_TID_COOKIE_NAME ?? 'u', '', { httpOnly: false, sameSite: "strict", secure: false, signed: true, maxAge: 0, overwrite: true });
  } catch (err: any) {
    ctx.throw(err);
  }
};