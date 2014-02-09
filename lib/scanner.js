exports.scan = function (path, context, handler) {
  var parser;

  if (context.parsers instanceof Array) {
    for (var i = 0; i < context.parsers.length; i++) {
      parser = context.parsers[i];
      if (parser.test(path)) {
        parser.parse(path).then(
          // success
          function (data) {
            handler(null, data);
          },
          // error
          function (data) {
            handler(data);
          });
        return;
      }
    }
  }
  // fall through
  handler("No parser found");
};

