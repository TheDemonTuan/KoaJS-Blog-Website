import { ParameterizedContext } from 'koa';
import { json } from 'stream/consumers';

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
  error_type?: string;
  data?: DataT;
}

export default (ctx: ParameterizedContext, response: IResponses, status: number): void => {
  ctx.type = 'application/json';
  ctx.body = response;
  ctx.status = status;
}