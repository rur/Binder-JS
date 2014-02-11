// var scanner = require("scanner");
var p = require("./promise");


function Binder () {
  // body...
}

Binder.prototype.compile = function(config) {
  var promCtrl = new p.PromiseCtrl("Binder Compile");
  promCtrl.resolve("this is a test");
  return promCtrl.promise;
};

exports.Binder = Binder;