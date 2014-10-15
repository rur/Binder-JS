var when = require("when");

var e = require("./expression");
var s = require("./scanner");
var Parser = require("./parser");
var BinderSyntaxError = require("./syntax").Error;
var BinderException = require("./exception").BinderException;
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

  var syntax = context.syntax;

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
 * @param   {string}    name   The route name that this compile step represents, use it to track the scanning process
 * @return  {Promise}           An A+ compliant promise which will receive the parsed data
 */
Binder.prototype.compile = function (subject, name) {
  // compile statements into context parser rules
  var cxt = this.context.child(name);
  var syntax = cxt.syntax;
  [].push.apply(
    cxt.parsers,
    this.statements.map(_createParser.bind(null, syntax))
  );
  return s.scan(subject, cxt, this.compileTimeout)
    .catch(function (reason) {
      var excp = reason;
      if (excp instanceof BinderException) {
        excp.parents.push(cxt);
      } else if (reason !== undefined) {
        excp = new BinderException(reason, subject, cxt);
      }
      return when.reject(excp);
    });
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
      cmnd, i, after, args, prc;
  try {
    for (i = 0; i < commands.length; i++) {
      cmnd = commands[i];
      args = cmnd.args.slice();
      after = (typeof _last(args) === 'function') ? args.pop() : undefined;

      if (_last(commands) === cmnd) {
        parse.add(syntax.getParser(commands[i].name).proc);
        parse.add(after);
        parse.defaultParams = [undefined, undefined].concat(args);
      } else {
        prc = syntax.getCondition(cmnd.name).proc;
        cond.add(prc.liftPredicate.apply(prc, [undefined, undefined].concat(args)));
        cond.add(after);
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
  var stmt = commands.map(function (cmd) {
    return cmd.name + (cmd.args.length ? '(' + cmd.args.map(function (v) {
      if (typeof v === 'function')
        return (v.name || 'f') + '()';
      else
        return JSON.stringify(v);
    }).join(',') + ')' : '');
  }).join('.');
  return new Parser(cond, parse, stmt);
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