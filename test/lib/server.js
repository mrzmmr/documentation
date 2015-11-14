'use strict';

var test = require('tap').test,
  concat = require('concat-stream'),
  File = require('vinyl'),
  http = require('http'),
  Server = require('../../lib/server');

function get(url, callback) {
  http.get(url, function (res) {
    res.pipe(concat(function (text) {
      if (res.statusCode >= 400) {
        return callback(res.statusCode);
      }
      callback(text.toString());
    }));
  });
}

var jsFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.js',
  contents: new Buffer('var test = 123;')
});

var coffeeFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.coffee',
  contents: new Buffer('test = 123')
});

test('server', function (t) {
  var server = new Server();
  t.ok(server, 'server is initialized');
  server.start(function () {
    t.test('base path', function (tt) {
      get('http://localhost:4001/test/file.coffee', function (code) {
        tt.equal(code, 404, 'does not have a file, emits 404');
        tt.end();
      });
    });

    t.test('base path', function (tt) {
      server.setFiles([coffeeFile]);
      get('http://localhost:4001/test/file.coffee', function (text) {
        tt.equal(text, 'test = 123', 'emits response');
        tt.end();
      });
    });

    t.test('reset files', function (tt) {
      server.setFiles([coffeeFile, jsFile]);
      get('http://localhost:4001/test/file.js', function (text) {
        tt.equal(text, 'var test = 123;', 'emits response');
        tt.end();
      });
    });

    t.test('cleanup', function (tt) {
      server.stop(function () {
        tt.end();
      });
    });

    t.end();
  });
});
