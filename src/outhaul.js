const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const session = require('koa-session');
const qs = require('query-string');

const logger = require('./logger').get();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function outhaul(options) {
  const app = new Koa();
  app.keys = ['hemligt'];

  const { port } = options;

  const strategies = [];

  const authenticationCallback = '/oauth2/callback';

  options.strategies.forEach((strategy) => {
    if (strategy.setupPassportStrategy) {
      const callbackUrl = `http://localhost:3000${authenticationCallback}`; // Refactor!!!,
      const passportStrategy = strategy.setupPassportStrategy(callbackUrl);

      passport.use(passportStrategy);
    }

    if (strategy.getName) {
      strategies[strategy.getName()] = strategy;
    } else {
      logger.warn(`Failed to add strategy: ${strategy}`);
    }
  });

  const connections = [];
  const router = new Router();

  let appInstance;

  app.use(passport.initialize());
  app.use(session({}, app));

  app.use(bodyParser());
  app.use(router.routes());

  router.get('/health', (ctx) => {
    ctx.response.body = 'ok';
  });

  router.get(authenticationCallback, async (ctx, next) => {
    logger.debug('callbacked');

    const parsedQs = qs.parse(ctx.request.querystring);

    const connection = connections.find(c => c.uuid() === parsedQs.state);

    if (connection) {
      logger.debug('connection');
      await passport.authenticate(connection.getPassportStrategyName(), { failureRedirect: '/login' }, (err, accessToken, refreshToken) => {
        connection.authenticationCallback(accessToken, refreshToken);
        ctx.response.body = 'You are authenticated';
      })(ctx, next);
    } else {
      ctx.throw(400, 'Cannot find matching connection with uuid mathing callback state');
    }
  });

  function addConnection(connection) {
    connections.push(connection);

    const uniqueUrl = `/${connection.uuid()}`; router.get(uniqueUrl, async (ctx) => {
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    });

    if (connection.authentication) {
      router.get(`${uniqueUrl}/authentication`, (ctx, next) => passport.authenticate(connection.getPassportStrategyName(), { scope: connection.scope ? connection.scope : '', state: connection.uuid() })(ctx, next));
    }

    return uniqueUrl;
  }

  router.post('/connections/add', async (ctx) => {
    const input = ctx.request.body;

    if (input.connector) {
      if (strategies[input.connector]) {
        logger.debug('connector match ', strategies[input.connector]);

        const connection = strategies[input.connector].newConnector(input.params);

        logger.debug('connection ', connection);

        ctx.response.body = addConnection(connection);
      } else {
        ctx.throw(404, `Could not find connector: ${input.connector}`);
      }
    } else {
      ctx.throw(400, 'Connector not specified');
    }
  });


  function start() {
    appInstance = app.listen(port);
    return appInstance;
  }

  function close() {
    appInstance.close();
  }

  return {
    start,
    close,
    addConnection,
  };
}

module.exports = outhaul;
