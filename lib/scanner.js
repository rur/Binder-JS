var when = require('when');
var sequence = require('when/sequence');

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