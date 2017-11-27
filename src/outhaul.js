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

  // function addConnection(connection) {
  //   connections.push(connection);
  //
  //   const uniqueUrl = `/connections/${connection.uuid()}`;
  //
  //   // const uniqueUrl = `/${connection.uuid()}`; router.get(uniqueUrl, async (ctx) => {
  //   //   if (connection.authenticated === undefined || connection.authenticated()) {
  //   //     ctx.response.body = await connection.getData();
  //   //   } else {
  //   //     ctx.throw(401, 'Authentication is needed to access this connection.');
  //   //   }
  //   // });
  //
  //   // if (connection.authentication) {
  //   //   router.get(`${uniqueUrl}/authentication`, (ctx, next) => passport.authenticate(connection.getPassportStrategyName(), { scope: connection.scope ? connection.scope : '', state: connection.uuid() })(ctx, next));
  //   // }
  //
  //   return uniqueUrl;
  // }

  router.get('/connections/:id/authentication', (ctx, next) =>
  {
    let connection = connections.find((c) => c.id === ctx.params.id);

    if(connection){
      return  passport.authenticate(connection.getPassportStrategyName(), { scope: connection.scope ? connection.scope : '', state: connection.uuid() })(ctx, next);
    }else{
      ctx.throw(400, 'No connection matches id');
    }
  });

  router.get('/connections/:id', async (ctx) => {
    let connection = connections.find((c) => c.id === ctx.params.id);

    if(connection){
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    }else{
      ctx.throw(400, 'No connection matches id');
    }
  });


  router.post('/connections/', async (ctx) => {
    const input = ctx.request.body;

    if (input.connector) {
      if (strategies[input.connector]) {
        logger.debug('connector match ', strategies[input.connector]);

        const connection = strategies[input.connector].newConnector(input.params);

        logger.debug('connection ', connection);

        connections.push(connection);

        const uniqueUrl = `/connections/${connection.uuid()}`;

        ctx.response.body = uniqueUrl;
      } else {
        ctx.response.body = "Couldn't find connector";
      }
    } else {
      ctx.response.body = 'Connector not specified';
    }
  });

  router.delete('/connections/:id', (ctx) => {
    let connection = connections.find((c) => c.id === ctx.params.id);

    let idx = connections.indexOf(connection);
    connections.splice(idx, 1);

    logger.debug("Connection removed: ", connection.id);

    ctx.response.body = 'ok';
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
    close
  };
}

module.exports = outhaul;
