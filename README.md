[![CircleCI](https://circleci.com/gh/nypublicradio/nypr-fastboot.svg?style=svg)](https://circleci.com/gh/nypublicradio/nypr-fastboot)

# nypr-fastboot

FastBoot app server preloaded with middlware for NYPR ember apps.

## Usage
```node
const fastboot = require('nypr-fastboot');

const server = fastboot({
  bucket: process.env.AWS_BUCKET,
  manifestKey: process.env.FASTBOOT_MANIFEST,
  healthCheckerUA: 'ELB-HealthChecker',
  sentryDSN: process.env.SENTRY_DSN,
  env: process.env.ENV,
  serviceName: process.env.SERVICE_NAME
});

server.start();
```

FastBoot config options (e.g. `gzip`, `port`, `chunkedResponse`) can be passed in an object under the key `fastbootConfig`, like so:
```node
const fastboot = require('nypr-fastboot');

const server = fastboot({
  bucket: process.env.AWS_BUCKET,
  manifestKey: process.env.FASTBOOT_MANIFEST,
  healthCheckerUA: 'ELB-HealthChecker',
  sentryDSN: process.env.SENTRY_DSN,
  fastbootConfig: { port: 5000 },
  env: process.env.ENV,
  serviceName: process.env.SERVICE_NAME
})
```

## Included Middleware

### health-checker

Bypasses FastBoot if the `User-Agent` header matches the configured `healthCheckerUA` value.

### preview

Allows to load a particular build of the ember app instead of the currently activated default for the current environment.

**Note** using this middleware requires that an index file is shipped to s3 using the `ember-cli-deploy-s3-index` deploy plugin.

Targets a specific build using the `v` and `build` query params according to the specifications below:

- `v`: loads the  the index file located at `index.html:<v>`.
- `build`: the build key is used as a prefix and loads the index file located at `<build>/index.html`.
- `v` and `build`: combines the above and loads the index file located at `<build>/index.html:<v>`

If neither are passed, this middleware is a no op and it moves onto the next function in the middleware stack.

## Tests

Run the tests with:
```node
$ npm test
```

## Sentry
To configure sentry, create a new project at https://sentry.wnyc.org/sentry/. 
The creation of that project will automatically generate a DSN. It will look something like this: `https://<KEY>@sentry.wnyc.org/<PROJECT_ID>`.
 
In the project that imports this library, make sure to include the `sentryDSN` parameter when initializing the fastboot server. Best practices around this are to set `sentryDSN` to an environment variable which can be configured at deployment time.

## Statsd
Statsd is a metrics collection and aggregation agent that can plug into a number of backends. We use it to send application metrics to our graphite backend. The collector is installed on the same machine that graphite runs on, and the client responsible for generating and sending metrics is included as a middleware in the lib directory.

The `env` and `serviceName` parameters passed into the fastboot constructor are used to namespace the metrics being sent to statsd. Examples of these parameters are `env: 'demo'` and `serviceName: 'wnyc-studios-web-client'`. Passing in these parameters will produce a metric with the following name `stats.demo.wnyc-studios-web-client.<metric_type>.<metric_name>`.

