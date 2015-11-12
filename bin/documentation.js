#!/usr/bin/env node

/* eslint no-console: 0 */

'use strict';

var documentation = require('../'),
  chokidar = require('chokidar'),
  debounce = require('debounce'),
  streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  lint = require('../lib/lint'),
  args = require('../lib/args.js');

var parsedArgs = args(process.argv.slice(2));

var generator = generate.bind(null,
  parsedArgs.inputs,
  documentation.formats[parsedArgs.formatter],
  parsedArgs.formatterOptions,
  parsedArgs.options,
  parsedArgs.output);

if (parsedArgs.watch) {
  chokidar.watch(parsedArgs.inputs)
    .on('all', debounce(generator, 300));
} else {
  generator();
}

function generate(inputs, formatter, formatterOptions, options, destination) {
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
            .pipe(vfs.dest(destination));
        } else {
          fs.writeFileSync(destination, output);
        }
      } else {
        process.stdout.write(output);
      }
    });
  });
}
