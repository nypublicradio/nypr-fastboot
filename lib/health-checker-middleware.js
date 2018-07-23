module.exports = function ({ uaString = '' }) {
  return function healthChecker({ headers }, res, next) {
    let { 'user-agent':ua = '' } = headers;
    if (uaString.match(ua)) {
      return res.sendStatus(200);
    }
    return next();
  }
}
