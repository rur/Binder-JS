var Parser = require("./parser");

function Rule (context) {

  this.__defineGetter__("parse", function () {
    var exp = context.createParserExpr();

    return __extend(function (t, p) {
      if (typeof t === "function" ) exp.when(t);
      if (typeof p === "function" ) exp.parseFile(p);
      return exp;
    }, exp);
  });

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };
}

module.exports = Rule;

/////////////////
// Private
/////////////////

function __extend (dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    dest[name] = src[name];
  });
  return dest;
}