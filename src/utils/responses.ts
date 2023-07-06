import { ParameterizedContext } from 'koa';

/**
 * @description: This is the interface for responses
 * @interface IResponses
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]
 */

export interface IResponses<DataT = any> {
  success: boolean;
  message: string;
  data?: DataT;
}

export default (ctx: ParameterizedContext, response: IResponses, status: number): void => {
  ctx.body = response;
  ctx.status = status;
}