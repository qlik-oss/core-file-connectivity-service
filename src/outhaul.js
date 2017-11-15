const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const qs = require('query-string');


function outhaul(options) {
  const app = new Koa();

  const port = options.port;
  const strategies = options.strategies;

  const connections = [];

  const router = new Router();

  let appInstance;

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

    if(connection){
      await connection.authenticationCallback(parsedQs.code);
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
      console.log(connection.authenticationCallbackUrl())

      router.get(`${uniqueUrl}/authentication`, (ctx, next) => {
        const callback = connection.authentication(ctx, authenticationCallback);
        return next();
      });
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
