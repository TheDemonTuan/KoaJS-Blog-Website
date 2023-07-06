import Router from '@koa/router';
const router: Router = new Router();
import { signInIndex } from '../controllers/signin.controller';

router.get('signin', '/', signInIndex);

export default router;
