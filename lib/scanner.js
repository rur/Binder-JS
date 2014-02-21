var p = require("./promise");

exports.scanFile = function (path, context) {
  var filter,
      parser,
      promise;

  function triggerFilter () {
    return p.callAsync(this.filter, path, context);
  }

  for (var i = 0, len = context.filters.length; i < len; i++) {
    filter = context.filters[i];
    if (promise) {
      promise = promise.chain(triggerFilter.bind({filter: filter}));
    } else {
      promise = triggerFilter.call({filter: filter});
    }
  }

  function triggerParser () {
    for (var i = context.parsers.length - 1; i >= 0; i--) {
      parser = context.parsers[i];
      if (parser.test(path, context)) {
        // NOTE: Should the parser function receive the context?
        return parser.parse(path);
      }
    }
    this.reject("No parser found");
  }

  if (promise) {
    promise = promise.chain(function () {
      return p.callAsync(triggerParser);
    });
  } else {
    promise = p.callAsync(triggerParser);
  }

  return promise;
};