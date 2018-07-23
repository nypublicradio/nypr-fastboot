const FastBootAppServer = require('fastboot-app-server');
const S3Downloader = require('fastboot-s3-downloader');
const S3Notifier = require('fastboot-s3-notifier');

const healthChecker = require('./lib/health-checker-middleware');
const preview = require('./lib/preview-middleware');

require('dotenv').config();

let downloader = new S3Downloader({
  bucket: process.env.AWS_BUCKET,
  key: process.env.FASTBOOT_MANIFEST,
});

let notifier = new S3Notifier({
  bucket: process.env.AWS_BUCKET,
  key: process.env.FASTBOOT_MANIFEST,
});

module.exports = function({ bucket, uaString }) {

  let server = new FastBootAppServer({
    beforeMiddleware(app) {
      app.use(healthChecker({ uaString }));
      app.use(preview({ bucket }));
    },
    downloader,
    notifier,
    gzip: true,
    chunkedResponse: true,
  });

  return server;

}
