module.exports = function ({ uaString }) {
  return function healthChecker({ headers }, res, next) {
    let { 'user-agent':ua = '' } = headers;
    if (ua.match(uaString)) {
      return res.sendStatus(200);
    }
    return next();
  }
}
