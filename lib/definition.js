var Syntax = require("./syntax");

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
    if (typeof base === "function") {
      func = base;
      base = [];
    } else if (typeof base === "string") {

    } else {
      throw new Error("invalid parser base specified");
    }
    this.parsers[name] = {name: name, base: base, func: func};
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
  buildSyntax: function () {
    var syntax = new Syntax();
    var defs = this.deps.concat(this);
    for (var i = 0; i < defs.length; i++) {
      if (!defs[i].conditions || !defs[i].parsers) {
        console.log("defs", defs[i].conditions, defs[i].parsers, i, this);
      }
      _extend(syntax.conditions, defs[i].conditions);
      _extend(syntax.parsers, defs[i].parsers);
    }
    return syntax;
  }
};

module.exports = Definition;

/////////////////
// Private
/////////////////

function _extend (dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    dest[name] = src[name];
  });
  return dest;
}