const morgan = require('morgan');

/* The reason for the weird colon escaping here is the Morgan Library.
The way it identifies special keywords is to preceed them with a ':', i.e. ':remote-user'
So if we want to include actual ':' in the string message, they must be escaped.*/

/* eslint-disable */
const LOG_FORMAT = '{\
"@timestamp"\: ":date[clf]",\
"message"\: "\
clientip\::req[x-forwarded-for]|\
user\::remote-user|\
verb\::method|\
request\::url|\
protocol\::http-version|\
status\::status|\
size\::res[content-length]|\
referrer\:":referrer"|\
agent\:":user-agent"|\
duration\::response-time"}';
/* eslint-enable */

const DEFAULT_OPTIONS = {
  skip: req => req.headers['user-agent'] === 'ELB-HealthChecker/2.0'
};

module.exports = function(options = {}) {
  options = {...DEFAULT_OPTIONS, ...options};

  return morgan(LOG_FORMAT, options);
}