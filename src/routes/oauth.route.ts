import Router from '@koa/router';
const router: Router = new Router();
import { authGoogle, authGoogleCallback } from '../controllers/oauth.controller.js';

//----------------------------------------------------------------GOOGLE OAUTH2---------------------------------------------------------------
router.get('/google', authGoogle)
router.get('/google/verify', authGoogleCallback);

export default router;