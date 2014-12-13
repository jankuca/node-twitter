var querystring = require('querystring');


/**
 * @constructor
 */
var MockTwitter = function (http, options) {
  this.$http = http;

  this.requests = [];
  this.request_keys = [];
  this.children = [];

  this.options = options || {};

  this.interceptors_ = {};
};


MockTwitter.API_HOST = 'api.twitter.com';
MockTwitter.API_ROOT_PATH = '/v1.0';


MockTwitter.prototype.interceptRequestInTest = function (
    method, path, interceptor) {
  var key = method + ' ' + path;
  this.interceptors_[key] = this.interceptors_[key] || [];
  this.interceptors_[key].push(interceptor);
};


MockTwitter.prototype.get = function (path, params, callback) {
  return this.request_('GET', path, params, null, callback);
};


MockTwitter.prototype.post = function (path, content, content_type, callback) {
  var body = {
    content: content,
    content_type: content_type
  };
  if (typeof content !== 'string' && !Buffer.isBuffer(body)) {
    body.content_type = 'application/x-www-form-urlencoded'
  }
  return this.request_('POST', path, {}, body, callback);
};


MockTwitter.prototype.request_ = function (
    method, path, params, body, callback) {
  this.logRequest_(method, path, params, body);

  var interceptors = this.interceptors_[method + ' ' + path];
  var self = this;
  setTimeout(function () {
    var url = path;
    if (Object.keys(params).length > 0) {
      url += '?' + querystring.stringify(params);
    }

    var req_headers = {};
    if (body) {
      req_headers["Content-Type"] = body.content_type;
      if (body.content) {
        if (Buffer.isBuffer(body.content)) {
          req_headers["Content-length"] = body.content.length;
        } else {
          req_headers["Content-length"] = Buffer.byteLength(body.content);
        }
      } else {
        req_headers["Content-length"] = 0;
      }
    }

    var req_options = {
      method: method,
      host: MockTwitter.API_HOST,
      path: MockTwitter.API_ROOT_PATH + url,
      headers: req_headers
    }
    self.$http.request(req_options, function (res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });

      res.once('end', function () {
        var data = JSON.parse(body || null);
        if (res.statusCode >= 400) {
          return callback(new Error('Request failed.'), data, res);
        }
        callback(null, data, res);
      });
    });
  }, 0);
};


MockTwitter.prototype.createChild = function (config_extension) {
  var child = Object.create(this);
  child.requests = [];
  child.children = [];

  if (config_extension) {
    child.options = Object.create(this.options);
    Object.keys(config_extension || {}).forEach(function (key) {
      child.options[key] = config_extension[key];
    });
  }

  this.children.push(child);
  return child;
};


MockTwitter.prototype.logRequest_ = function (
    method, path, params, body) {
  body = body || {};
  var req_log = {
    method: method,
    path: path,
    params: params,
    body: body
  };
  this.requests.push(req_log);
  this.request_keys.push(method + ' ' + path);
};


module.exports = MockTwitter;
