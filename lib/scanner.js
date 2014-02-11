var p = require("./promise");

exports.scan = function (path, context, handler) {
  var parser,
      scanProm = new p.PromiseCtrl("Scanner Promise for '"+path+"'");

  for (var i = 0, len = context.parsers.length; i < len; i++) {
    parser = context.parsers[i];
    if (parser.test(path)) {
      break;
    } else {
      parser = null;
    }
  }
  if (parser) {
    parser.parse(path).then(
      scanProm.resolve.bind(scanProm),
      scanProm.reject.bind(scanProm)
    );
  } else {
    scanProm.reject("No parser found");
  }
  return scanProm.promise;
};

