/* eslint-env node */
const FastBootAppServer = require('fastboot-app-server');
const S3Downloader = require('fastboot-s3-downloader');
const S3Notifier = require('fastboot-s3-notifier');
const aws = require('aws-sdk');

const s3 = new aws.S3();

require('dotenv').config();

function healthChecker({ headers }, res, next) {
  let { 'user-agent':ua = '' } = headers;
  if (ua.match('ELB-HealthChecker')) {
    return res.sendStatus(200);
  }
  return next()
}

function qaBuild(options) {
  return async function({ query }, res, next) {
    if (query.build) {
      try {
        let response = await s3.getObject({Bucket: options.bucket, Key: `index.html:${query.build}`}).promise();
        return res.send(response.Body.toString());
      } catch(e) {
        next();
      }
    } else {
      next();
    }
  }
}

let downloader = new S3Downloader({
  bucket: process.env.AWS_BUCKET,
  key: process.env.FASTBOOT_MANIFEST,
});

let notifier = new S3Notifier({
  bucket: process.env.AWS_BUCKET,
  key: process.env.FASTBOOT_MANIFEST,
});

let server = new FastBootAppServer({
  beforeMiddleware(app) {
    app.use(healthChecker);
    app.use(qaBuild({ bucket: process.env.AWS_BUCKET }));
  },
  downloader,
  notifier,
  gzip: true,
  chunkedResponse: true,
});

module.exports = server;
