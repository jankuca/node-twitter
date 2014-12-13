
var Twitter = require('./lib/twitter');


module.exports = Twitter;
module.exports.OAuth = require('./lib/oauth');
module.exports.Twitter = Twitter;


module.exports.mocks = {
  MockTwitter: require('./lib/mocks/mock-twitter')
};
