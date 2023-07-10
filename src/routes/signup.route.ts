import Router from '@koa/router';
const router: Router = new Router();
import { signUpIndex } from '../controllers/signup.controller.js';

router.get('/', signUpIndex);

export default router;
