var Context = require("./context");
var s = require("./scanner");
var Rule = require("./rule");

function Binder (cxt) {
  this.context = cxt;
  Rule.call(this, cxt);
}

Binder.prototype.compile = function(path) {
  return s.scan(this.context, path, this.compileTimeout);
};

module.exports = Binder;