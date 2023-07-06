import { Next, ParameterizedContext } from "koa";
import axios from 'axios';
import UserModel from "../models/user.model";
import { createJwt, setJwtCookie } from '../utils/jwt';

//----------------------------------------------------------------GOOGLE OAUTH2---------------------------------------------------------------
const googleAuthURL: string = 'https://accounts.google.com/o/oauth2/v2/auth';
const redirectURI: string = 'http://localhost:3000/auth/google/verify';
const clientID: string = process.env.GOOGLE_CLIENT_ID || 'clientID';
const clientSecret: string = process.env.GOOGLE_CLIENT_SECRET || 'clientSecret';

// [GET] /auth/google
export const authGoogle = async (ctx: ParameterizedContext) => {
  const authURL: string = `${googleAuthURL}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=openid email profile`;
  ctx.redirect(authURL);
};

// [GET] /auth/google/verify
export const authGoogleCallback = async (ctx: ParameterizedContext) => {
  const code = ctx.query.code;
  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: redirectURI,
      grant_type: 'authorization_code'
    });

    const { data: userInfo } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${data.access_token}`
      }
    });

    const userModel = new UserModel();
    const user = await userModel.findByEmail(userInfo.email);

    if (user) {
      const jwt = await createJwt({ id: user.id });
      await setJwtCookie(ctx, jwt.data || '');
      ctx.redirect('/');
    } else {
      await ctx.render('oauth', { title: 'Google Oauth' });
    }
  } catch (err: any) {
    if (err.response.status === 400) {
      ctx.throw(400, 'Invalid Code');
    }
    else
      ctx.throw(err);
  }
  //ctx.redirect('/');
}