var p = require("./promise");
var cx = require("./context");


function Binder () {
  // register default filters and parsers here
  this.context = new cx.DefaultContext();
}

Binder.prototype.compile = function(config) {
  var promCtrl = new p.PromiseCtrl("Binder Compile");
  promCtrl.resolve("this is a test");
  return promCtrl.promise;
};

exports.Binder = Binder;
