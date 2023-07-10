import Router from '@koa/router';
const router: Router = new Router();
import { signInIndex } from '../controllers/signin.controller.js';

router.get('/', signInIndex);

export default router;
