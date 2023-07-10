import Router from '@koa/router';
const router: Router = new Router();
import apiV1Route from './api/v1.route.js';
import homeRoute from './home.route.js';
import signInRoute from './signin.route.js';
import signUpRoute from './signup.route.js';
import oauthRoute from './oauth.route.js';
import logoutRoute from './logout.route.js';
import { needLogged, isLogged } from '../middlewares/authorization.middleware.js';

// API route
router.use('/api/v1', apiV1Route.routes()).use(apiV1Route.allowedMethods());

// Auth route
router.use('/oauth', oauthRoute.routes());

// Sign in route
router.use('/signin', isLogged, signInRoute.routes());

// Sign up route
router.use('/signup', isLogged, signUpRoute.routes());

// Log out route
router.use('/logout', needLogged, logoutRoute.routes());

// Home route
router.use('/', homeRoute.routes());

export default router;
