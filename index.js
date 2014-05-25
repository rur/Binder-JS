var Definition = require("./lib/definition");
var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Rule = require("./lib/rule");
var scanner = require("./lib/scanner");

var definitions = {};

// default
var defaultDef = require("./lib/default")(new Definition());

// build API
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
    var deps = [defaultDef], dep, dName;
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
    var def = defaultDef;
    var cxt = new Context();
    if (defName) {
      if (!definitions.hasOwnProperty(defName)) {
        throw new Error("Cannot create binder, no definition was found with the name: '" + defName + "'");
      }
      def = definitions[defName];
    }
    cxt._syntax = def.buildSyntax();
    var binder = new Binder(cxt);
    def.initialize(binder);
    return binder;
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
  },
  /**
   * Scan a specified path and return data promise, this is used
   * in parse handlers to direct the recursion towards a file
   *
   * @param  {string}   path       The path to scan
   * @param  {Context}  context    A binder Context object
   * @param  {number}   timeout_ms The number of milliseconds to wait before
   *                               the scan cancels, defaults to 7000
   * @return {promise}             A Promises/A+ compliant promise
   */
  scanFile: scanner.scanFile
};

// Export API
module.exports = binder_js_api;