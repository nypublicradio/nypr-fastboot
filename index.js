const FastBootAppServer = require('fastboot-app-server');
const S3Downloader = require('fastboot-s3-downloader');
const S3Notifier = require('fastboot-s3-notifier');
const Raven = require('raven');
const morgan = require('morgan');

const healthChecker = require('./lib/health-checker-middleware');
const preview = require('./lib/preview-middleware');

const FASTBOOT_DEFAULTS = {
  gzip: true,
  chunkedResponse: true,
};

module.exports = function({ bucket, manifestKey, healthCheckerUA, sentryDSN, fastbootConfig = {} }) {

  fastbootConfig = {...FASTBOOT_DEFAULTS, ...fastbootConfig};

  if (sentryDSN) {
    Raven.config(sentryDSN).install();
  } else {
    console.log("You must provide a Sentry DSN.");
    process.exit(1);
  }

  let beforeMiddleware = app => {
    app.use(morgan('combined', {
              skip: function (req, res) { return req.headers['user-agent'] == 'ELB-HealthChecker/2.0' } }));
    app.use(healthChecker({ uaString: healthCheckerUA }));
    app.use(preview({ bucket }));
    app.use((req, res, next) => {
      res.type('text/html');
      next();
    });
  }

  if (fastbootConfig.distPath) {
    console.log('`distPath` specified. running in local mode.');
    return new FastBootAppServer({
      beforeMiddleware,
      ...fastbootConfig,
    });
  } else {
    let downloader = new S3Downloader({
      bucket,
      key: manifestKey,
    });

    let notifier = new S3Notifier({
      bucket,
      key: manifestKey,
    });

    return new FastBootAppServer({
      beforeMiddleware,
      downloader,
      notifier,
      ...fastbootConfig,
    });
  }

}
