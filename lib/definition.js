var Syntax = require("./syntax");
var proc = require("./proc");

/**
 * Define a binder syntax and initialization
 *
 * @constructor
 * @param {string}            name      The name identifier for this definition
 * @param {Array<Definition>} requires  Array of dependent definition names in the order you want them applied
 */
function Definition (name, requires) {
  this.name = name;
  this.requires = requires || [];
  this.parsers = {};
  this.conditions = {};
  this.inits = [];
}

Definition.prototype = {
  /**
   * Add a parse function to the rule definition syntax
   *
   * @param  {string}   name  The field that the parser will have
   * @param  {*string}  base  An Optional parser function to apply before this is evoked
   * @param  {function} func  The parser function
   * @return {Definition}     This definition
   */
  parser: function (name, base, func) {
    var ba = base,
        fn = func;
    if (typeof base === "function") {
      fn = base;
      ba = null;
    }
    this.parsers[name] = {
      name: name,
      base: ba,
      func: fn
    };
    return this;
  },
  /**
   * Add a condition boolean function to the rule definition syntax
   *
   * @param  {string}   name  The field that this parser will have
   * @param  {function} func  The boolean test function
   * @return {Definition}     This definition
   */
  condition: function (name, func) {
    this.conditions[name] = {name: name, func: func};
    return this;
  },
  /**
   * Register an initialization function to run on any binder instances
   * created involving this definition
   *
   * @param  {function} func  A function with the signature: function(binder) {}
   * @return {Definition}     This definition object
   */
  init: function (func) {
    this.inits.push(func);
  },
  /**
   * apply the init functions to a binder instance
   *
   * @param  {Binder} binder The binder instance to be initialized
   */
  initialize: function (binder) {
    for (var j = 0; j < this.inits.length; j++) {
      this.inits[j](binder);
    }
  },
  /**
   * Configure a syntax object with all the defined conditions and parsers
   *
   * The syntax instance passed in must already have been configured by the
   * definitions 'required' by this definition
   *
   * @param   {Syntax} syntax The syntax instance to build on
   */
  buildSyntax: function (syntax) {
    var def = this;

    Object.keys(def.conditions)
      .forEach(function (name) {
        var p = proc(def.conditions[name].func);
        syntax.conditions[name] = {
          name: name,
          proc: p
        };
      });

    Object.keys(def.parsers)
      .forEach(function (name) {
        var psr = def.parsers[name];
        var p = proc(psr.func);
        syntax.parsers[name] = {
          name: name,
          proc: p
        };
        if (psr.base) {
          if (!syntax.parsers.hasOwnProperty(psr.base)) {
            throw new Error(def.name + "#" + psr.name + ": Base parser '" + psr.base + "' was not found");
          }
          p.addBefore(syntax.parsers[psr.base].proc);
        }
      });
  }
};

module.exports = Definition;
