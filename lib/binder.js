var Context = require("./context");
var s = require("./scanner");

function Binder (context) {
  this.context = context;


  this.__defineGetter__("parse", function () {
    var exp = context.createParserExpr();

    return __extend(function (t, p) {
      if (typeof t === "function" ) exp.when(t);
      if (typeof p === "function" ) exp.parse(p);
      return exp;
    }, exp);
  });

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };

  this.prepare = function prepare(prepareFunc) {
    context.filters.unshift(prepareFunc);
  };
}

Binder.prototype.compile = function(path) {
  return s.scan(this.context, path, this.compileTimeout);
};

/////////////////
// Export
/////////////////

module.exports = Binder;


/////////////////
// Private
/////////////////

function __extend (dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    dest[name] = src[name];
  });
  return dest;
}