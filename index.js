var Definition = require("./lib/definition");
var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Rule = require("./lib/rule");

var definitions = {};

var binder_js_api = {
  /**
   * Create a new binder syntax definition
   *
   * @param  {string}         name      The unique name of this Binder
   * @param  {array<string>}  depNames  Base definitions to extend
   * @return {Definition}   Binder definition object with which you can
   *                               now define syntax rules
   */
  define: function (name, depNames) {
    var deps = [], dep, dName;
    if (depNames instanceof Array) {
      for (var i = 0; i < depNames.length; i++) {
        dName = depNames[i];
        if (!definitions.hasOwnProperty(dName)) {
          throw "Binder definition '"+dName+"' not found";
        }
        deps.push(definitions[dName]);
      }
    }
    var def = definitions[name] = new Definition(name, deps);
    return def;
  },
  /**
   * Create an instance of a binder specifying the name of the
   * syntax definition to use.
   *
   * You now attached new filters and parsers.
   *
   * @param  {string} defName Binder syntax definition name, 'default' if undefined
   * @return {Binder}         The binder instance that implements
   *                              rules for attaching data handlers
   */
  create: function (defName) {
    if (!definitions.hasOwnProperty(defName)) {
      throw new Error("Cannot create binder, no definition was found with the name: '" + defName + "'");
    }
    var def = definitions[defName];
    var cxt = new Context();
    cxt._syntax = def.buildSyntax();
    return new Binder(cxt);
  },
  /**
   * Create rule object to defined new parse rules for this context and
   * sub contexts.
   *
   * @param  {Context} cxt The context instance to add the rules too
   * @return {Rule}     Binder rule
   */
  rule: function (cxt) {
    return new Rule(cxt);
  }
};


module.exports = binder_js_api;