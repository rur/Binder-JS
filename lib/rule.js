var Parser = require("./parser");

function Rule (context) {
  this.context = context;

  this.__defineGetter__("parse", function () {
    var test, parser;
    function tryAddParser() {
      if (test && parser) {
        context.parsers.push(new Parser(test, parser));
      }
    }
    // api
    var api = {};
    api.when = function (fnc) {
      test = fnc;
      tryAddParser();
      return api;
    };
    api.read = function (fnc) {
      parser = fnc;
      tryAddParser();
      return api;
    };
    return extend(function (t, p) {
      test = t;
      parser = p;
      tryAddParser();
      return api;
    }, api);
  });

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };
}

module.exports = Rule;


function extend (dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    dest[name] = src[name];
  });
  return dest;
}