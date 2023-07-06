import Router from '@koa/router';
const router: Router = new Router();
import { homeIndex } from '../controllers/home.controller';

router.get('home', '/', homeIndex);

export default router;