import Router from '@koa/router';
const router: Router = new Router();
import apiV1Route from './api/v1.route';
import homeRoute from './home.route';
import signInRoute from './signin.route';
import signUpRoute from './signup.route';
import authRoute from './auth.route';

// API route
router.use('/api/v1', apiV1Route.routes()).use(apiV1Route.allowedMethods());

// Auth route
router.use('/auth', authRoute.routes());

// Sign in route
router.use('/signin', signInRoute.routes());

// Sign up route
router.use('/signup', signUpRoute.routes());

// Home route
router.use('/', homeRoute.routes());

export default router;
