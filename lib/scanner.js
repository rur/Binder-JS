var p = require("./promise");

exports.scanFile = function (path, context, timeout_ms) {
  var filter,
      parser,
      scan = new p.PromiseCtrl("scanner#scanFile"),
      promise = scan.promise;

  function wrapFilter (filter) {
    return function () {
      return filter.call(this, path, context);
    };
  }

  for (var i = 0, len = context.filters.length; i < len; i++) {
    filter = context.filters[i];
    promise = promise.then(wrapFilter(filter));
  }

  // parser
  promise = promise.then(function() {
    for (var i = context.parsers.length - 1; i >= 0; i--) {
      parser = context.parsers[i];
      if (parser.condition(path, context)) {
        this.handle(parser.parse)(path, context);
        return this.promise;
      }
    }
    this.reject("No parser found");
    return this.promise;
  });

  // response promise and timeout

  var scanFilePCtrl = new p.PromiseCtrl("ScanFile: " + path);
  var scanFilePromise = scanFilePCtrl.promise;
  promise.then(function (data) {
    if (!scanFilePromise.isCompleted) {
      scanFilePCtrl.resolve(data);
    }
  },function (data) {
    scanFilePCtrl.reject(data);
  });

  timeout_ms = timeout_ms || 7000;
  setTimeout(function() {
    if (!scanFilePromise.isCompleted) {
      scanFilePCtrl.reject("File scan timed out after " + timeout_ms + " msec");
    }
  }, timeout_ms);

  // kick off the scanning
  scan.resolve();

  return scanFilePromise;
};