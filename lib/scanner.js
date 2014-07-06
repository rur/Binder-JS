var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');

/**
 * Scan a specified subject and return data promise
 *
 * @param  {Context}  context    A binder Context object
 * @param  {string}   subject    The subject to scan
 * @param  {number}   timeout_ms The number of milliseconds to wait before
 *                               the scan cancels, defaults to 7000
 * @return {promise}             A Promises/A+ compliant promise
 */
exports.scan = function (subject, context, timeout_ms) {

  var filterSeq = sequence(context.filters, subject, context),
      promise;

  promise = filterSeq.then(function () {
    var parser;
    for (var i = context.parsers.length - 1; i >= 0; i--) {
      parser = context.parsers[i];
      if (parser.condition.liftPredicate()(subject, context)) {
        parser.parse.defaultParams[1] = context;
        return pipeline(parser.parse.liftSeries(), subject);
      }
    }
    return when.reject("No parser found");
  });

  return promise.timeout(timeout_ms || 7000);
};