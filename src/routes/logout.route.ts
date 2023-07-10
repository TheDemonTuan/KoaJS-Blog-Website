import Router from '@koa/router';
const router: Router = new Router();
import { logOutIndex } from '../controllers/logout.controller.js';

router.get('/', logOutIndex);

export default router;
