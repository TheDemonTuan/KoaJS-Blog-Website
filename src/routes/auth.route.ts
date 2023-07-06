import Router from '@koa/router';
const router: Router = new Router();
import { authGoogle, authGoogleCallback } from '../controllers/auth.controller';

//----------------------------------------------------------------GOOGLE OAUTH2---------------------------------------------------------------
router.get('/google', authGoogle)
router.get('/google/verify', authGoogleCallback);

export default router;