#!/usr/bin/env node

/* eslint no-console: 0 */

'use strict';

var documentation = require('../'),
  streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  lint = require('../lib/lint'),
  args = require('../lib/args.js');

var parsedArgs = args(process.argv.slice(2));

generate(
  parsedArgs.inputs,
  documentation.formats[parsedArgs.formatter],
  parsedArgs.formatterOptions,
  parsedArgs.options,
  parsedArgs.output, function (err, res) {
});

function generate(inputs, formatter, formatterOptions, options, destination, callback) {
  documentation(inputs, options, function (err, comments) {
    if (err) {
      throw err;
    }

    if (options.lint) {
      var lintOutput = lint.format(comments);
      if (lintOutput) {
        console.log(lintOutput);
        process.exit(1);
      } else {
        process.exit(0);
      }
    }

    formatter(comments, formatterOptions, function (err, output) {
      if (destination !== 'stdout') {
        if (formatter === 'html') {
          streamArray(output)
            .pipe(vfs.dest(destination))
            .on('end', callback);
        } else {
          fs.writeFile(destination, output, callback);
        }
      } else {
        process.stdout.write(output);
      }
    });
  });
}
