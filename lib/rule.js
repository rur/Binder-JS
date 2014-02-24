var Parser = require("./parser");

function Rule (context) {
  this.context = context;

  this.__defineGetter__("parse", function () {
    var test, parser;
    function addParser() {
      if (test && parser) {
        context.parsers.push(new Parser(test, parser));
      }
    }
    // api
    var api = function (prd, act) {
      test = prd;
      parser = act;
      addParser();
      return api;
    };
    api.when = function (fnc) {
      test = fnc;
      addParser();
      return api;
    };
    api.read = function (fnc) {
      parser = fnc;
      addParser();
      return api;
    };
    return api;
  });

  // this.parse = function parse(test, parser) {
  //   function addParser() {
  //     if (test && parser) {
  //       context.parsers.push(new Parser(test, parser));
  //     }
  //   }
  //   addParser();

  // };

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };
}

module.exports = Rule;