var Parser = require("./parser");

function Rule (context) {
  this.context = context;

  this.parse = function parse(test, parseFn) {
    context.parsers.push(new Parser(test, parseFn));
  };

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };
}

module.exports = Rule;