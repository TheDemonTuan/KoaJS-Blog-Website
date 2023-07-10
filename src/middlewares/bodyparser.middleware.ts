import { Next, ParameterizedContext } from 'koa';
import sendResponse from '../utils/responses.js';
import querystring from 'querystring';

declare module 'koa' {
  interface Request {
    body?: any;
  }
}

const getRawBody = (req: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const length = req.headers['content-length'];
    const limit = 5 * 1024 * 1024; // 5MB
    const encoding = req.headers['content-encoding'] || 'identity';
    if (length && length > limit) {
      reject(new Error(`content length ${length} exceeds limit of ${limit}`));
    }
    if (encoding !== 'identity') {
      reject(new Error(`unsupported content encoding ${encoding}`));
    }
    let received = 0;
    let buffer: any[] = [];
    req.on('data', (chunk: any) => {
      received += chunk.length;
      if (received > limit) {
        reject(new Error(`content length ${length} exceeds limit of ${limit}`));
      }
      buffer.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(buffer).toString());
    });
    req.on('error', reject);
  });
}

export default async (ctx: ParameterizedContext, next: Next) => {
  const parsedMethods: string[] = ['POST', 'PUT', 'PATCH'];
  if (!parsedMethods.includes(ctx.method.toUpperCase())) return await next();
  try {
    const rawBody = await getRawBody(ctx.req);
    const contentType = ctx.headers['content-type'];

    switch (contentType?.split(';')[0]) {
      case 'application/json':
        ctx.request.body = await JSON.parse(rawBody);
        break;
      case 'application/x-www-form-urlencoded':
        ctx.request.body = querystring.parse(rawBody);
        break;
      default:
        ctx.request.body = {};
        break;
    }
    await next();
  } catch (err: any) {
    sendResponse(ctx, { success: false, message: 'Body parser error !' }, 500);
  }
}