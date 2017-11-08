const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const uuid = require('uuid/v1');
const passport = require('koa-passport');

function outhaul(options) {
  const app = new Koa();

  const port = options.port;
  const adapters = options.adapters;

  const connections = [];

  const router = new Router();

  app.use(bodyParser());
  app.use(passport.initialize());
  app.use(router.routes());

  router.get('/health', (ctx) => {
    ctx.response.body = 'ok';
  });

  let appInstance;

  function addConnection(connection) {
    connections.push(connection);


    const uniqueUrl = `/${uuid()}`; router.get(uniqueUrl, async (ctx) => {
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    });

    if (connection.authentication) {

      const callbackUrl = `${uniqueUrl}/authentication_callback`;


      router.get('/googledrive/authentication/callback', async (ctx, next) => {

        console.log(ctx.request);

        await connection.authenticationCallback(ctx);

        return;
      });

      router.get(`${uniqueUrl}/authentication`, (ctx, next) => {
        const callback = connection.authentication(ctx, 'http://localhost:3000/googledrive/authentication/callback'); //Neeed to fetch host and port!!!!!!!

        //console.log(`${uniqueUrl}/authentication`);
        //ctx.body = 'authenticated';

        return next();
      });


            // const callbackUrl = `/${connection.getName()}/authentication/callback`;
            //
            // connection.initiatedPassportStrategy(`http://localhost:${port}${callbackUrl}`);
            //
            // router.get(callbackUrl, (ctx, next) => passport.authenticate(connection.getPassportStrategy().name, (err, profile) => {
            //     if (profile) {
            //         ctx.body = 'Success';
            //     } else {
            //         ctx.body = 'Failed to get profile';
            //     }
            // })(ctx, next));

            // passport.use(connection.getPassportStrategy());
    }

    return uniqueUrl;
  }

  router.post('/connections/add', async (ctx) => {
    const input = ctx.request.body;

    if (input.adapter) {
      if (adapters[input.adapter]) {
        const connection = new adapters[input.adapter](...input.params);
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
