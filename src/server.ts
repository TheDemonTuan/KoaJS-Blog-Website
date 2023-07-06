import Koa from 'koa';
import dotenv from 'dotenv'

dotenv.config();
const app: Koa = new Koa();
const PORT: number | undefined = parseInt(process.env.PORT || '3000');

// Middlewares
import middlewares from './middlewares/index.middleware';
middlewares(app);

const server = app
  .listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  }).on('error', (err) => {
    console.error(err);
    server.close();
  });