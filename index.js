var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Binder = require("./lib/binder");
var scanner = require("./lib/scanner");
var register = require("./lib/register");

// binders
require('./lib/binders/fs-reader');


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
    return register(name, depNames);
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
    var def = register.getDef(defName);
    var cxt = new Context();
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
   * @return {Binder}
   */
  binder: function (cxt) {
    return new Binder(cxt);
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
  scan: scanner.scan
};


// Export API
module.exports = binder_js_api;