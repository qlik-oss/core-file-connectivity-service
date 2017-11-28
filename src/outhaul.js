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

  const strategies = [];

  const authenticationCallback = '/oauth2/callback';

  options.strategies.forEach((strategy) => {
    if (strategy.getName) {
      strategies[strategy.getName()] = strategy;
      if (strategy.setupPassportStrategy) {
        const callbackUrl = `http://localhost:3000${authenticationCallback}`; // Refactor!!!,
        const passportStrategy = strategy.setupPassportStrategy(callbackUrl);
        passport.use(passportStrategy);
      }
    } else {
      logger.warn(`Failed to add strategy: ${strategy}`);
    }
  });

  const connections = [];
  const apiVersion = 'v1';
  const router = new Router({
    prefix: `/${apiVersion}`,
  });

  let appInstance;

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

    const connection = connections.find(c => c.uuid() === parsedQs.state);

    if (connection) {
      logger.debug('connection');
      await passport.authenticate(connection.getPassportStrategyName(), {
        failureRedirect: '/login',
      }, (err, accessToken, refreshToken) => {
        connection.authenticationCallback(accessToken, refreshToken);
        ctx.response.body = 'You are authenticated';
      })(ctx, next);
    } else {
      ctx.throw(400, 'Cannot find matching connection with uuid mathing callback state');
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
    const connection = connections.find(c => c.id === ctx.params.id);

    if (connection) {
      return passport.authenticate(connection.getPassportStrategyName(), {
        scope: connection.scope ? connection.scope : '',
        state: connection.uuid(),
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
    const connection = connections.find(c => c.id === ctx.params.id);

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
      if (strategies[input.connector]) {
        logger.debug('connector match ', strategies[input.connector]);

        const connection = strategies[input.connector].newConnector(input.params);

        logger.debug('connection ', connection);

        connections.push(connection);

        const uniqueUrl = `/connections/${connection.uuid()}`;

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
    const connection = connections.find(c => c.id === ctx.params.id);

    if (connection) {
      const idx = connections.indexOf(connection);
      connections.splice(idx, 1);

      logger.debug('Connection removed: ', connection.id);

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
 *         description: Parameters to pass to the connector
 *         type: array
 */

module.exports = outhaul;
