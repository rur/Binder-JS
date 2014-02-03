// var scanner = require("scanner");


function Binder () {
  // body...
}

Binder.prototype.compile = function(config) {
  config.handler(null, "this is a test file");
};

exports.Binder = Binder;