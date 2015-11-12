var http = require('http'),
  lr = require('tiny-lr');

function server() {
  var server = lr().listen(35729, function () {
  });
  server.reload();
}

module.exports = server;
