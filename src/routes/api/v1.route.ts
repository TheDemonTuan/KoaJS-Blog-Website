import Router from '@koa/router';
const router: Router = new Router();
//-------------------------------------------------- USERS START -------------------------------------------------//

import { userSignIn, userSignUp } from '../../controllers/api/v1/users.controller.js';
import { userSignInValidator, userSignUpValidator } from '../../middlewares/validator.middleware.js';
import { recaptchaV2Verify, recaptchaV3Verify } from '../../middlewares/recaptcha.middleware.js';

router.post('/users/signup', recaptchaV2Verify, userSignUpValidator, userSignUp);

router.post('/users/signin', recaptchaV3Verify, userSignInValidator, userSignIn);

//-------------------------------------------------- USERS END --------------------------------------------------//

export default router;
