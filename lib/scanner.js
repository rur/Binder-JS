var when = require('when');
var sequence = require('when/sequence');

/**
 * Scan a specified path and return data promise
 *
 * @param  {string}   path       The path to scan
 * @param  {Context}  context    A binder Context object
 * @param  {number}   timeout_ms The number of milliseconds to wait before
 *                               the scan cancels, defaults to 7000
 * @return {promise}             A Promises/A+ compliant promise
 */
exports.scanFile = function (path, context, timeout_ms) {
  var filterSeq = sequence(context.filters, path, context),
      promise;

  promise = filterSeq.then(function () {
    var parser;
    for (var i = context.parsers.length - 1; i >= 0; i--) {
      parser = context.parsers[i];
      if (parser.condition(path, context)) {
        return when.try(parser.parse, path, context);
      }
    }
    return when.reject("No parser found");
  });

  return promise.timeout(timeout_ms || 7000);
};