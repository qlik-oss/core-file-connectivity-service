const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const session = require('koa-session');
const qs = require('query-string');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function outhaul(options) {
  const app = new Koa();
  app.keys = ['hemligt'];

  const port = options.port;

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
    console.log('callbacked');

    const parsedQs = qs.parse(ctx.request.querystring);

    const connection = connections.find(c => c.uuid() === parsedQs.state);

    if (connection) {
      console.log('connection');
      await passport.authenticate(connection.getPassportStrategyName(), { failureRedirect: '/login' }, (err, accessToken, refreshToken) => {
        connection.authenticationCallback(accessToken, refreshToken);
        ctx.response.body = 'You are loged in';
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
        console.log('connector match ', strategies[input.connector]);

        const connection = strategies[input.connector].newConnector(input.params);

        console.log('connection ', connection);

        ctx.response.body = addConnection(connection);
      } else {
        ctx.response.body = "Couldn't find connector";
      }
    } else {
      ctx.response.body = 'Connector not specified';
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
