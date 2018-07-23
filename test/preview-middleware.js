const assert = require('assert');
const AWS = require('aws-sdk-mock');
const sinon = require('sinon');

const middleware = require('../lib/preview-middleware');
const BUCKET = 'test-bucket';

const DUMMY_RESPONSE = {
  Body: Buffer.from('foo')
};

const getObject = sinon.stub().callsArgWith(1, null, DUMMY_RESPONSE);
const next = sinon.mock('next').never();
const response = {send: sinon.mock('send response').once()};

describe('preview middleware', function() {

  afterEach(function() {
    AWS.restore('S3');

    next.reset();
    response.send.reset();
  });

  it('allows undecorated requests to pass through', async function() {
    const next = sinon.mock('next').once();
    const response = {send: sinon.mock('send response').never()};
    const previewMiddleware = middleware({bucket: BUCKET});

    AWS.mock('S3', 'getObject', getObject);
    await previewMiddleware({ query: {} }, response, next);

    next.verify();
    response.send.verify();
  });

  it('requests the given revision for the default default build', async function() {
    const VERSION = '123abc';
    AWS.mock('S3', 'getObject', getObject);

    const previewMiddleware = middleware({bucket: BUCKET});

    await previewMiddleware({ query: { v: VERSION }}, response, next);

    assert.ok(getObject.calledWith({
      Bucket: BUCKET,
      Key: `index.html:${VERSION}`,
    }));

    next.verify();
    response.send.verify();
  });

  it('requests the activated revision for a given build', async function() {
    const BUILD = 'new-feature';

    AWS.mock('S3', 'getObject', getObject);

    const previewMiddleware = middleware({bucket: BUCKET});

    await previewMiddleware({ query: { build: BUILD }}, response, next);

    assert.ok(getObject.calledWith({
      Bucket: BUCKET,
      Key: `${BUILD}/index.html`
    }), 'should pass expected keys');

    next.verify();
    response.send.verify();
  })

  it('requests the given revision for a given build', async function() {
    const VERSION = '123abc';
    const BUILD = 'new-feature';

    AWS.mock('S3', 'getObject', getObject);

    const previewMiddleware = middleware({bucket: BUCKET});

    await previewMiddleware({ query: { build: BUILD, v: VERSION }}, response, next);

    assert.ok(getObject.calledWith({
      Bucket: BUCKET,
      Key: `${BUILD}/index.html:${VERSION}`
    }));

    next.verify();
    response.send.verify();
  });

  it('defaults to the default build if the given revision is not available', async function() {
    const VERSION = 'not-there';
    const next = sinon.mock('next').once();
    const response = {send: sinon.mock('send response').never()};
    let getObject = sinon.stub().callsArgWith(1, {code: 'NoSuchKey'}, null);
    AWS.mock('S3', 'getObject', getObject);

    const previewMiddleware = middleware({bucket: BUCKET});

    await previewMiddleware({ query: { v: VERSION } }, response, next)

    next.verify();
    response.send.verify();
  })
});
