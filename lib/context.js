var Parser = require("./parser");
var p = require("./promise");
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
 * @return {object} A hash table with a statement (name -> function) mapped for each condition
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
    parseFile: function (fnc) {
      if (!cond) {
        throw "Cannot create a parser rule without a condition";
      }
      cxt.parsers.push(new Parser(cond, fnc));
      cond = null;
    }
  };
  //
  // apply syntax to parser expression
  //
  var syntax = this._syntax,
      name;
  // Conditions
  for (name in syntax.conditions) {
    expr[name] = __createCondStatement(expr, syntax.conditions[name]);
  }
  // Parsers
  for (name in syntax.parsers) {
    expr[name] = __createParseStatement(expr, syntax.parsers[name]);
  }
  return expr;
};

module.exports = Context;


////////////////
// Private
////////////////

/**
 * Short circuit function fanning together two boolean functions
 *
 * @param  {function} cond_1 First boolean function to test
 * @param  {function} cond_2 If that was true, test this one
 * @return {function}        AND boolean function
 */
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
/**
 * Utility to separate user syntax handler args from user defined after
 * function. Has to do with how syntax defined functions receive arguments
 *
 * @private
 * @param  {array} args   Arguments object from the caller
 * @return {object}       args -> array of the user args, after -> user after function
 */
function __parseArgs (args) {
  args = Array.prototype.slice.call(args);
  var after;
  if (args.length > 0) {
    if (typeof args[args.length-1] === "function") {
      after = args.pop();
    }
  }
  return {args: args, after: after};
}

function __createCondStatement (expr, condDef) {
  return function () {
    var params = __parseArgs(arguments);
    expr.when(function (p,c) {
      return condDef.func.call(this, p, c, params.args);
    });
    if (typeof params.after === "function") {
      expr.when(params.after);
    }
    return expr;
  };
}

function __createParseStatement (expr, pDef) {
  return function () {
    var params = __parseArgs(arguments);
    expr.parseFile(function (pth, cxt) {
      this.handle(pDef.func)(pth, cxt, params.args);

      if (params.after) {
        return this.promise.then(function (data) {
          this.handle(params.after)(data, cxt);
          return this.promise;
        });
      }
      return this.promise;
    });
  };
}