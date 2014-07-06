var e = require("./expression");
var s = require("./scanner");
var Parser = require("./parser");
var BinderSyntaxError = require("./syntax").Error;
var proc = require("./proc");

/**
 * A binder brings together the syntax and api for defining
 * parse rules and filters as well as an api for triggering the
 * parsing process
 *
 * @constructor
 * @param {Context} context The context for this binders process
 */
function Binder(context) {
  var b = this;
  b.context = context;
  b.statements = [];

  var syntax = context._syntax;

  this.__defineGetter__("parse", function () {
    var exp = e.create(syntax);
    b.statements.push(exp.commands);
    return exp.command;
  });

  this.filter = function filter(filterFunc) {
    context.filters.push(filterFunc);
  };

  this.prepare = function prepare(prepareFunc) {
    context.filters.unshift(prepareFunc);
  };
}

/**
 * Compile all the data needed and scan a specified subject
 *
 * @param   {mixed}     subject The identifier that will be used to retrieve the data
 * @param   {string}    route   The route name that this compile step represents, use it to track the scanning process
 * @return  {Promise}           An A+ compliant promise which will receive the parsed data
 */
Binder.prototype.compile = function (subject, route) {
  // compile statements into context parser rules
  var cxt = this.context.dup();
  var syntax = cxt._syntax;
  (cxt.route = cxt.route || []).push(route || ".");
  [].push.apply(
    cxt.parsers,
    this.statements.map(_createParser.bind(null, syntax))
  );
  this.statements = [];
  return s.scan(subject, cxt, this.compileTimeout);
};

/////////////////
// Export
/////////////////

module.exports = Binder;

/////////////////
// Private
/////////////////

/**
 * Convert a expression statement (array of commands from an Expression object)
 * into a Parser instance
 *
 * @private
 * @param  {Syntax}     syntax      The syntax registry
 * @param  {Array<obj>} commands    A series of command objects from an expression
 * @param  {uint}       ind         The index of the statement
 * @throws {Error} If any statement is not valid
 * @return {Parser}     A populated parser
 */
function _createParser(syntax, commands, ind) {
  var cond = proc(),
      parse = proc(),
      cmnd, i, after, args;
  try {
    for (i = 0; i < commands.length; i++) {
      cmnd = commands[i];
      args = cmnd.args.slice();
      after = (typeof _last(args) === 'function') ? args.pop() : undefined;

      if (_last(commands) === cmnd) {
        parse.add(syntax.getParser(commands[i].name).proc);
        parse.add(after);
        parse.defaultParams = ['[data here]', '[context here]'].concat(args);
      } else {
        cond.add(syntax.getCondition(cmnd.name).proc);
        cond.add(after);
        cond.defaultParams = ['[data here]', '[context here]'].concat(args);
      }
    }
  } catch (er) {
    if (er instanceof BinderSyntaxError) {
      cond = parse = null;
    } else {
      throw er;
    }
  }
  if (!cond || cond.length < 1 || !parse || parse.length < 1) {
    throw new Error("Cannot compile parser, invalid rule statement[" + ind + "]: '" + commands.map(function (cmnd) {
      return cmnd.name;
    }).join(" ") + "'");
  }
  return new Parser(cond, parse);
}

/**
 * Get the last element of an array
 *
 * @private
 * @param  {Array} arr
 * @return {mixed} The last element of the array passed in
 */
function _last(arr) {
  return arr[arr.length - 1];
}