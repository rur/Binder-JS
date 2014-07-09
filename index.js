var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Definition = require("./lib/definition");

// binders
// require('./lib/binders/fs-reader');

function jsBinder(setup) {
  var cxt, def, binder;
  if (setup instanceof Context) {
    cxt = setup;
    binder = new Binder(cxt);
  } else {
    if (setup instanceof Definition ) {
      def = setup;
    } else {
      def = jsBinder.loadDef((setup || 'default'));
    }
    cxt = new Context();
    cxt._syntax = def.buildSyntax();
    binder = new Binder(cxt);
    def.initialize(binder);
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

/**
 * Load one of the built in parser definitions
 *
 * @param  {string}     name The name of the parser to load
 * @return {Definition}      The populated definition
 */
jsBinder.loadDef = function loadDef(name) {
  try {
    return require("./lib/binders/" + name)();
  } catch (er) {
    throw new Error("Unable to load parser definition: '" + name + "'");
  }
};


// Export API
module.exports = jsBinder;