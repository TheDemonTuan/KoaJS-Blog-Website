import Koa from 'koa';
import views from '@ladjs/koa-views';
import serve from 'koa-static';
import path from 'path';
import routes from '../routes/index.route.js';
import errorHandler from './error-handler.middleware.js';
import constructorMiddleware from './constructor.middleware.js';
import session from './session.middleware.js';
import KeyGrip from 'keygrip';
import bodyParser from './bodyparser.middleware.js';
import authenticationMiddleware from './authentication.middleware.js';
import messageMiddleware from './message.middleware.js';

export default async (app: Koa): Promise<void> => {
  //Keys
  app.keys = new KeyGrip([process.env.COOKIE_SKEY_1 ?? 'secret1', process.env.COOKIE_SKEY_2 ?? 'secret2', process.env.COOKIE_SKEY_3 ?? 'secret3', process.env.COOKIE_SKEY_4 ?? 'secret4', process.env.COOKIE_SKEY_5 ?? 'secret5'], 'sha256');

  // Error handler
  app.use(errorHandler);

  // Body parser
  app.use(bodyParser);

  // View engine
  const render = views(path.resolve(__dirname, 'views'), { extension: 'pug', options: { pretty: true } })
  app.use(render)

  // Static files
  app.use(serve(path.resolve(__dirname, 'public'), { gzip: true }));

  // Session
  app.use(session);

  // Constructor
  app.use(constructorMiddleware);

  // Messages
  app.use(messageMiddleware);

  // Authentication
  app.use(authenticationMiddleware);

  // Router
  app.use(routes.routes());

}
