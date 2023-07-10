import Router from '@koa/router';
const router: Router = new Router();
import { homeIndex } from '../controllers/home.controller.js';

router.get('/', homeIndex);

export default router;