var Syntax = require("./syntax");
var proc = require("./proc");

/**
 * Define a binder syntax and initialization
 *
 * @constructor
 * @param {string}            name  The name identifier for this definition
 * @param {Array<Definition>} deps  Array of dependent definitions
 */
function Definition (name, deps) {
  this.name = name;
  this.deps = deps || [];
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
    var defs = this.deps.concat(this);
    for (var i = 0; i < defs.length; i++) {
      for (var j = 0; j < defs[i].inits.length; j++) {
        defs[i].inits[j](binder);
      }
    }
  },
  /**
   * Get a specific parsers name from this definition or its dependent defs
   *
   * @param  {string} name The name of the parser to retrieve
   * @return {Object}      A parser definition object
   */
  getParser: function (name) {
    var parser;
    if (this.parsers.hasOwnProperty(name)) {
      parser = this.parsers[name];
    } else {
      for (var i = 0, len = this.deps.length; i < len; i++) {
        parser = this.deps[i].getParser(name);
        if (parser) break;
      }
    }
    return parser;
  },
  /**
   * Create a syntax object with all of this and the dependent definitions
   * conditions and parsers
   *
   * @return {Syntax}
   */
  buildSyntax: function (syn) {
    var syntax = syn || new Syntax(),
        def = this;

    for (var i = 0; i < this.deps.length; i++) {
      this.deps[i].buildSyntax(syntax);
    }

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
        if (psr.base) {
          p.addBefore(syntax.parsers[psr.base].proc);
        }
        syntax.parsers[name] = {
          name: name,
          proc: p
        };
      });

    return syntax;
  }
};

module.exports = Definition;
