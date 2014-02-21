var p = require("./promise");

exports.scanFile = function (path, context) {
  var filter,
      parser,
      scanProm = new p.PromiseCtrl("Scanner Promise for '"+path+"'");

  function returns () {
    return scanProm.promise;
  }

  var i, len, status = {};

  for (i = 0, len = context.filters.length; i < len; i++) {
    filter = context.filters[i];
    filter.call(status, path, context);
    if (status.error) {
      scanProm.reject(status.error);
      return returns();
    }
    if (status.ignore) {
      scanProm.resolve();
      return returns();
    }
  }

  for (i = context.parsers.length - 1; i >= 0; i--) {
    parser = context.parsers[i];
    if (parser.test(path, context)) {
      parser.parse(path).then(
        scanProm.resolve.bind(scanProm),
        scanProm.reject.bind(scanProm)
      );
      return returns();
    }
  }
  // fall through
  scanProm.reject("No parser found");
  return returns();
};

