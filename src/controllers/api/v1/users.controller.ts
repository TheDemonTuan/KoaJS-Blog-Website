import { ParameterizedContext } from "koa";
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import UserModel from "../../../models/user.model";
import UserSchema from '../../../schemas/users.schema';
import sendResponse, { IResponses } from "../../../utils/responses";
import { createJwt, setJwtCookie } from "../../../utils/jwt";

const userModel: UserModel = new UserModel();

// [POST] /users/signin
export const userSignIn = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    const user = await userModel.findByUsername(ctx.request.body.username);

    if (!user)
      return sendResponse(ctx, { success: false, message: 'Username or password is incorrect.' }, 400);
    else if (!bcryptjs.compareSync(ctx.request.body.password, user.password))
      return sendResponse(ctx, { success: false, message: 'Username or password is incorrect.' }, 400);

    const jwt = await createJwt({ id: user.id });

    if (!jwt.success)
      return sendResponse(ctx, jwt, 400);

    await setJwtCookie(ctx, jwt.data || '');

    sendResponse(ctx, { success: true, message: 'User signed in successfully.' }, 200);
  } catch (err: any) {
    return sendResponse(ctx, { success: false, message: 'Cant sign in, please try again later.' }, 500);
  }
};

// [POST] /users/signup
export const userSignUp = async (ctx: ParameterizedContext): Promise<void> => {
  try {
    //Create user schema
    const userSchema: UserSchema = {
      id: crypto.randomUUID(),
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
    ctx.throw(err);
  }
};