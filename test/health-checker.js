const sinon = require('sinon');
const middleware = require('../lib/health-checker-middleware');

describe('health checker middleware', function() {

  it('sends an empty 200 if the user agent matches', function() {
    const UA_STRING = 'foo-bar';
    const response = {sendStatus: sinon.mock('send response').withArgs(200).once()};
    const next = sinon.mock('next').never();

    const healthChecker = middleware({ uaString: UA_STRING });

    healthChecker({ headers: {'user-agent': UA_STRING }}, response, next);

    next.verify();
    response.sendStatus.verify();
  });

  it('it sends an empty 200 on partial matches', async function() {
    const UA_STRING = 'foo-bar';
    const response = {sendStatus: sinon.mock('send response').withArgs(200).once()};
    const next = sinon.mock('next').never();

    const healthChecker = middleware({ uaString: UA_STRING });

    healthChecker({ headers: {'user-agent': 'foo' }}, response, next);

    next.verify();
    response.sendStatus.verify();
  });

  it('calls next if the user agent does not match', async function() {
    const UA_STRING = 'foo-bar';
    const response = {sendStatus: sinon.mock('send response').never()};
    const next = sinon.mock('next').once();

    const healthChecker = middleware({ uaString: UA_STRING });

    healthChecker({ headers: {'user-agent': 'Chrome' }}, response, next);

    next.verify();
    response.sendStatus.verify();
  })
});
