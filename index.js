var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Definition = require("./lib/definition");

// binders
// require('./lib/binders/fs-reader');

function jsBinder(setup) {
  var cxt, def, binder;
  if (setup instanceof Definition) {
    def = setup;
    cxt = new Context();
    cxt._syntax = def.buildSyntax();
    binder = new Binder(cxt);
    def.initialize(binder);
  } else if (setup instanceof Context) {
    cxt = setup.dup();
    binder = new Binder(cxt);
  } else {
    throw new Error("Binder setup must either be a definition or the context from another binder process. Given: (" + setup + ")" );
  }
  return binder;
}

/**
 * Create a new binder syntax definition
 *
 * @param  {string}         name      The unique name of this Binder
 * @param  {array<string>}  depNames  Base definitions to extend
 * @return {Definition}   Binder definition object with which you can
 *                               now define syntax rules
 */
jsBinder.define = function defineBinder(name, dep) {
  return new Definition(name, dep);
};


// Export API
module.exports = jsBinder;