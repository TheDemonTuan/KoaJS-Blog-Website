import Koa, { Next, ParameterizedContext } from 'koa';
import bodyParser from '@koa/bodyparser';
import views from '@ladjs/koa-views';
import serve from 'koa-static';
import path from 'path';
import routes from '../routes/index.route';
import errorHandler from './error-handler.middleware';
import constructorMiddleware from './constructor.middleware';

export default async (app: Koa): Promise<void> => {

  //
  app.keys = [process.env.COOKIE_SECRET || 'secret'];

  // Body parser
  app.use(bodyParser());

  // View engine
  const render = views(path.join(__dirname, '..', 'views'), { extension: 'pug', options: { pretty: true } })
  app.use(render)

  // Static files
  app.use(serve(path.resolve(__dirname, '..', 'public'), { gzip: true }));

  // Error handler
  app.use(errorHandler);

  // Constructor
  app.use(constructorMiddleware);

  // Router
  app.use(routes.routes());

}
