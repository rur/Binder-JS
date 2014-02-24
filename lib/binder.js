var Context = require("./context");
var s = require("./scanner");
var Rule = require("./rule");

function Binder () {
  Rule.call(this, new Context());
}

Binder.prototype.compile = function(path) {
  return s.scanFile(path, this.context.dup(), this.compileTimeout);
};

module.exports = Binder;