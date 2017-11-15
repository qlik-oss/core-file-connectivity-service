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
  const strategies = options.strategies;

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

  //Note make this more generic ;)
  const authenticationCallback = '/oauth2/callback';

  router.get(authenticationCallback, async (ctx, next) => {
    const parsedQs = qs.parse(ctx.request.querystring);

    let connection = connections.find((c) => c.uuid() === parsedQs.state);


    console.log(JSON.stringify(parsedQs));
    if(connection){

      const res = await passport.authenticate('google', { failureRedirect: '/login' }, (err, accessToken) => {
        connection.authenticationCallback(accessToken);
      })(ctx, next);

      console.log("res ", res);

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
      //console.log(connection.authenticationCallbackUrl())


      connection.initiatedPassportStrategy(connection.redirectUrl);

      router.get(`${uniqueUrl}/authentication`, (ctx, next) => passport.authenticate(connection.getPassportStrategy().name, { scope: connection.scope ? connection.scope : '', state: connection.uuid() })(ctx, next));


      // router.get(`${uniqueUrl}/authentication`, (ctx, next) => {
      //   const callback = connection.authentication(ctx, authenticationCallback);
      //   return next();
      // });
    }

    passport.use(connection.getPassportStrategy());

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
