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

  const {
    port,
  } = options;

  const providers = [];

  const authenticationCallback = '/oauth2/callback';

  options.providers.forEach((provider) => {
    if (provider.getName) {
      providers[provider.getName()] = provider;
      if (provider.setupPassportStrategy) {
        const callbackUrl = `http://localhost:3000/v1${authenticationCallback}`; // Refactor!!!,
        const passportStrategy = provider.setupPassportStrategy(callbackUrl);

        if (passportStrategy) {
          passport.use(passportStrategy);
        }
      }
    } else {
      logger.warn(`Failed to add provider: ${provider}`);
    }
  });

  const connections = [];
  const apiVersion = 'v1';
  const router = new Router({

    prefix: `/${apiVersion}`,
  });

  let appInstance;

  function getConnection(connectionId) {
    return connections.find((c) => c.id === connectionId);
  }

  function removeConnection(connection) {
    const idx = connections.indexOf(connection);
    connections.splice(idx, 1);
    logger.info('Connection removed: ', connection.id);
  }

  app
    .use(passport.initialize())
    .use(session({}, app))
    .use(bodyParser())
    .use(router.routes());

  /**
   * @swagger
   * /health:
   *   get:
   *     description: Returns health status of the service
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: successful operation
   *         schema:
   *           type: string
   */
  router.get('/health', (ctx) => {
    ctx.response.body = 'ok';
  });

  router.get(authenticationCallback, async (ctx, next) => {
    logger.debug('callbacked');
    const parsedQs = qs.parse(ctx.request.querystring);

    const connection = getConnection(parsedQs.state);

    if (connection) {
      logger.debug('connection');
      await passport.authenticate(connection.getPassportStrategyName(), {
        failureRedirect: '/login',
      }, (err, accessToken, refreshToken) => {
        connection.authenticationCallback(accessToken, refreshToken);
        ctx.response.body = 'You are authenticated';
      })(ctx, next);
    } else {
      ctx.throw(400, 'Cannot find matching connection with id mathing callback state');
    }
  });

  /**
   * @swagger
   * /connections/{id}/authentication:
   *   get:
   *     description: Get authentication for a connection
   *     produces:
   *       - application/json
   *     parameters:
   *     - name: id
   *       in: path
   *       type: string
   *       required: true
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Connector not found
   */
  router.get('/connections/:id/authentication', (ctx, next) => {
    const connection = getConnection(ctx.params.id);

    if (connection) {
      return passport.authenticate(connection.getPassportStrategyName(), {
        scope: connection.scope ? connection.scope : '',
        state: connection.id,
      })(ctx, next);
    }
    ctx.throw(404, 'No connection matches id');

    return next();
  });

  /**
   * @swagger
   * /connections/{id}:
   *   get:
   *     description: Get data from a connector
   *     produces:
   *       - application/json
   *     parameters:
   *     - name: id
   *       in: path
   *       type: string
   *       required: true
   *     responses:
   *       200:
   *         description: Successful operation
   *       401:
   *         description: Authentication needed
   *       404:
   *         description: Connector not found
   */
  router.get('/connections/:id', async (ctx) => {
    const connection = getConnection(ctx.params.id);

    if (connection) {
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    } else {
      ctx.throw(404, 'No connection matches id');
    }
  });

  /**
   * @swagger
   * /connections:
   *   post:
   *     description: Create a new connection
   *     produces:
   *       - application/json
   *     parameters:
   *     - name: body
   *       in: body
   *       schema:
   *         $ref: '#/definitions/connection'
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Connector not found
   */
  router.post('/connections', async (ctx) => {
    const input = ctx.request.body;

    if (input.connector) {
      if (providers[input.connector]) {
        logger.debug('connector match ', providers[input.connector]);

        const connection = providers[input.connector].newConnector(input.params);

        logger.debug('connection ', connection);

        connections.push(connection);

        const uniqueUrl = `/connections/${connection.id}`;

        ctx.response.body = uniqueUrl;
      } else {
        ctx.throw(404, `Could not find connector: ${input.connector}`);
      }
    } else {
      ctx.throw(400, 'Connector not specified');
    }
  });

  /**
   * @swagger
   * /connections/{id}:
   *   delete:
   *     description: Delete a connection
   *     parameters:
   *     - name: id
   *       in: path
   *       type: string
   *       required: true
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Connector not found
   */
  router.delete('/connections/:id', (ctx) => {
    const connection = getConnection(ctx.params.id);

    if (connection) {
      removeConnection(connection);

      ctx.response.body = 'ok';
    } else {
      ctx.throw(404, `Could not find connection: ${ctx.params.id}`);
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
  };
}

/**
 * @swagger
 * definitions:
 *   connection:
 *     type: object
 *     properties:
 *       connector:
 *         description: Name of connector
 *         type: string
 *       params:
 *         description: Settings to pass to the connector
 *         type: object
 */

module.exports = outhaul;
