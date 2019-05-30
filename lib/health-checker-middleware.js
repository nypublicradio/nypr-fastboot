const STRATEGIES = {
  UA_SNIFF(uaString) {
    return function({ headers }, res, next) {
      let { 'user-agent':ua = '' } = headers;
      if (ua.match(uaString)) {
        return res.sendStatus(200);
      }
      return next();
    }
  },
  PATH_HANDLER: (_req, res) => res.sendStatus(200),
}

function findStrategy(options = {}) {
  if (options.uaString || options.strategy === 'ua-sniff') {
    return STRATEGIES.UA_SNIFF(options.uaString || options.string);
  }

  if (options.path || options.strategy === 'path') {
    return STRATEGIES.PATH_HANDLER;
  }

}

module.exports = function(options = {}) {
  let strategy = findStrategy(options);

  return function healthChecker(req, res, next) {
    return strategy(req, res, next);
  }
}
