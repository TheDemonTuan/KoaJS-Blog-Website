import { ParameterizedContext } from 'koa';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import UserModel from '../../../models/user.model.js';
import UserSchema from '../../../schemas/users.schema.js';
import sendResponse, { IResponses } from '../../../utils/responses.js';
import { setAuth } from '../../../utils/authentication.js';
import { setToken } from '../../../utils/redis.js';

const userModel: UserModel = new UserModel();

// [POST] /users/signin
export const userSignIn = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    const user = await userModel.findByUsername(ctx.request.body.username);
    if (!user || !bcryptjs.compareSync(ctx.request.body.password, user.password))
      return sendResponse(ctx, { success: false, message: 'Username or password is incorrect.' }, 400);

    await Promise.all([await setAuth(ctx, user.id, 86400), await setToken(user.id, 'info', user)]);

    const scriptsData = `
      location.href = '${ctx.protocol}://${ctx.hostname}:3000/';
    `;

    ctx.session.message = {
      type: 'success',
      message: 'User signed in successfully.'
    };

    sendResponse(ctx, { success: true, message: 'User signed in successfully.', data: scriptsData }, 201);
  } catch (err: any) {
    sendResponse(ctx, { success: false, message: 'Cant sign in, please try again later.' }, 500);
  }
};

// [POST] /users/signup
export const userSignUp = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    //Create user schema
    const userSchema: UserSchema = {
      id: Buffer.from(crypto.randomBytes(24)).toString('base64url'),
      display_name: ctx.request.body.display_name,
      email: ctx.request.body.email,
      username: ctx.request.body.username,
      password: bcryptjs.hashSync(ctx.request.body.password, bcryptjs.genSaltSync(11)),
    }
    //Create user modal
    const user: IResponses = await userModel.createNewUser(userSchema);
    if (user.success)
      sendResponse(ctx, user, 201);
    else
      sendResponse(ctx, user, 400);
  } catch (err: any) {
    sendResponse(ctx, { success: false, message: `Can't sign up, please try again later.` }, 500);
  }
};