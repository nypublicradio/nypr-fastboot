# nypr-fastboot

FastBoot app server preloaded with middlware for NYPR ember apps.

## Usage
```node
const fastboot = require('nypr-fastboot');

const server = fastboot({
  bucket: process.env.AWS_BUCKET,
  uaString: 'ELB-HealthChecker'
});

server.start();
```

## Included Middleware

### health-checker

Bypasses FastBoot if the `User-Agent` header matches the configured `uaString` value.

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
