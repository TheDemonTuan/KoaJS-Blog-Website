import Router from '@koa/router';
const router: Router = new Router();
//-------------------------------------------------- USERS START -------------------------------------------------//

import { userSignIn, userSignUp } from '../../controllers/api/v1/users.controller';
import { userSignInValidator, userSignUpValidator } from '../../middlewares/validator.middleware';
import { recaptchaV2Verify, recaptchaV3Verify } from '../../middlewares/recaptcha.middleware';

router.post('/users/signup', recaptchaV2Verify, userSignUpValidator, userSignUp);

router.post('/users/signin', userSignInValidator, userSignIn);

//-------------------------------------------------- USERS END --------------------------------------------------//

export default router;
