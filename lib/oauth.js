var oauth = require('oauth');
var util = require('util');


/**
 * @constructor
 * @extends {oauth.OAuth}
 * @param {Http=} http An HTTP API implementation.
 * @param {Https=} https An HTTPS API implementation.
 * @param {!Object.<string, *>} options OAuth options.
 */
var OAuth = function (http, https, options) {
  if (arguments.length === 1) {
    options = arguments[0];
    https = null;
    http = null;
  }

  https = https || require('https');
  http = http || require('http');

  var oauth_options = {
    consumerKey: options.consumer_key,
    consumerSecret: options.consumer_secret,
    version: '1.0',
    signatureMethod: 'HMAC-SHA1',
    nonceSize: null,
    customHeaders: options.headers || {
      'Accept': '*/*',
      'Connection': 'close'
    },
    requestUrl: options.request_token_url ||
        'https://api.twitter.com/oauth/request_token',
    accessUrl: options.access_token_url ||
        'https://api.twitter.com/oauth/access_token',
    authorize_callback: options.callback_url ||
        'https://api.twitter.com/oauth/authorize'
  };

  oauth.OAuth.call(this, http, https, oauth_options);
};

util.inherits(OAuth, oauth.OAuth);


module.exports = OAuth;
