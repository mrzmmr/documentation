var http = require('http'),
  liveReload = require('tiny-lr');

function Server() {
  this._files = [];
}

Server.prototype.setFiles = function (files) {
  this._files = files;
  if (this._lr) {
    this._lr.changed([]);
  }
};

Server.prototype.handler = function (request, response) {
  for (var i = 0; i < this._files.length; i++) {
    if (this._files[i].path === request.url) {
      this._files[i].pipe(response);
      return;
    }
  }
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('Not found');
};

Server.prototype.start = function (callback) {
  this._lr = liveReload();
  this._http = http.createServer(this.handler.bind(this));

  this._lr.listen(35729, function () {
    this._http.listen(4001, function () {
      callback();
    });
  }.bind(this));
};

Server.prototype.stop = function (callback) {
  this._http.close(function () {
    this._lr.close();
    callback();
  }.bind(this));
};

module.exports = Server;
