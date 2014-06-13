var when = require('when');
var sequence = require('when/sequence');

/**
 * Scan a specified subject and return data promise
 *
 * @param  {Context}  context    A binder Context object
 * @param  {string}   subject    The subject to scan
 * @param  {number}   timeout_ms The number of milliseconds to wait before
 *                               the scan cancels, defaults to 7000
 * @return {promise}             A Promises/A+ compliant promise
 */
exports.scan = function (context, subject, timeout_ms) {
  if (typeof context.dup  === 'function') {
    context = context.dup();
  }
  var filterSeq = sequence(context.filters, context, subject),
      promise;

  promise = filterSeq.then(function () {
    var parser;
    for (var i = context.parsers.length - 1; i >= 0; i--) {
      parser = context.parsers[i];
      if (parser.condition(context, subject)) {
        return when.try(parser.parse, context, subject);
      }
    }
    return when.reject("No parser found");
  });

  return promise.timeout(timeout_ms || 7000);
};