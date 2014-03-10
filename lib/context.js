var Parser = require("./parser");
var dup_exclude = ["filters", "parsers", "file"];

/**
 * The context is used to hold parsing state
 *
 * @constructor
 */
function Context () {
  this.filters = [];
  this.parsers = [];
}

/**
 * Create a deepish copy of itself
 *
 * @return {Context} A duplicate of this context
 */
Context.prototype.dup = function() {
  var dup = new Context();
  var cxt = this;
  dup.filters = cxt.filters.slice();
  dup.parsers = cxt.parsers.slice();
  Object.getOwnPropertyNames(cxt).forEach(function (name) {
    if (dup_exclude.indexOf(name) === -1) {
      dup[name] = cxt[name];
    }
  });
  return dup;
};

/**
 * Create an object which can be used to declare a parsing rule
 * by stringing together one or more conditions with a parse function.
 *
 * eg.
 *
 *     // Add a parser which will read .txt files using a utf parser
 *     // assuming 'fileExt' and 'readUTF' exist in the defined syntax
 *     var parse = cxt.createParserExp();
 *     parse.fileExt(".txt").readUTF();
 *
 *
 * @return {object} A hash table with a name -> function mapped for each condition
 *                   and parser defined in syntax
 */
Context.prototype.createParserExpr = function() {
  var cxt = this,
      cond,
      expr = {
    when: function (fnc) {
      if (cond) {
        fnc = __and(cond, fnc);
      }
      cond = fnc;
      return expr;
    },
    then: function (fnc) {
      if (!cond) {
        throw "Cannot add a parser without a condition";
      }
      parse = fnc;
      cxt.parsers.push(new Parser(cond, parse));
      cond = null;
    }
  };
  return expr;
};

module.exports = Context;


////////////////
// Private
////////////////

function __and (cond_1, cond_2) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    if (cond_1.apply(this, args)) {
      return cond_2.apply(this, args);
    } else {
      return false;
    }
  };
}