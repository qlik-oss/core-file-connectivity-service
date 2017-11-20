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

  let strategies = [];

  const authenticationCallback = '/oauth2/callback';

  options.strategies.forEach((strategy) => {

    if(strategy.PassportStrategy){

      let passportStrategy = new strategy.PassportStrategy({
          clientID: strategy.clientId,
          clientSecret: strategy.clientSecret,
          scope: strategy.scope,
          callbackURL: "http://localhost:3000" + authenticationCallback //Refactor!!!,
        },
        (accessToken, refreshToken, profile, done) => {
          return done(undefined, accessToken, refreshToken);
        });

      strategy.passportStrategyName = passportStrategy.name;

      console.log("Passport strategy ", strategy.passportStrategyName);

      passport.use(passportStrategy);
    }

    strategies[strategy.name] = strategy;
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

    console.log("callbacked");

    const parsedQs = qs.parse(ctx.request.querystring);

    let connection = connections.find((c) => c.uuid() === parsedQs.state);

    if(connection){
      console.log("connection");
      const res = await passport.authenticate(connection.getPassportStrategyName(), { failureRedirect: '/login' }, (err, accessToken) => {
        connection.authenticationCallback(accessToken);
      })(ctx, next);
    }
    else{
      ctx.throw(400, "Cannot find matching connection with uuid mathing callback state");
    }

    return;
  });

  function addConnection(connection) {
    connections.push(connection);

    connection.redirectUrl = "http://localhost:3000" + authenticationCallback; //Refactor!!!

    const uniqueUrl = `/${connection.uuid()}`; router.get(uniqueUrl, async (ctx) => {
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    });

    if (connection.authentication) {
      //connection.initiatedPassportStrategy(connection.redirectUrl); //Should be done at start up


      console.log("addconnection strategy ", connection.getPassportStrategyName());

      router.get(`${uniqueUrl}/authentication`, (ctx, next) => passport.authenticate(connection.getPassportStrategyName(), { scope: connection.scope ? connection.scope : '', state: connection.uuid() })(ctx, next));
    }

    return uniqueUrl;
  }

  router.post('/connections/add', async (ctx) => {
    const input = ctx.request.body;

    if (input.adapter) {
      if (strategies[input.adapter]) {
        const connection = new strategies[input.adapter](...input.params);
        ctx.response.body = addConnection(connection);
      } else {
        ctx.response.body = "Couldn't find adapter";
      }
    } else {
      ctx.response.body = 'Adapter not specified';
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
