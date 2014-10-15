var p = require("path");

var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Syntax = require("./lib/syntax");
var Definition = require("./lib/definition");

/**
 * Creates a new binder instance which can be used to define rules
 * and execute a compile process.
 *
 * It will create a fresh context and syntax build from any definitions supplied.
 * Otherwise a pre-configured context can be used to create the instance from.
 *
 * @param  {mixed} init Either zero or more Definitions or a pre-configured Context
 * @return {Binder}     Your new binder instance
 */
function jsBinder(init) {
  if (init instanceof Context) {
    return new Binder(init);
  }
  //
  var setup = {};
  _handleInit(setup, init);
  return _createBinder(setup);
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
    return require(p.resolve(__dirname, "lib", "binders", name))();
  } catch (er) {
    throw new Error("Unable to load parser definition: '" + name + "'");
  }
};

// -------
// Private
// -------
/**
 * Create and configure a new binder instance
 *
 * @param  {Object} setup All definitions required to configure the desired binder instance
 * @return {Binder}       A newly created and configured binder instance
 */
function _createBinder(setup) {
  var syn = new Syntax(),
      cxt = new Context(syn),
      binder = new Binder(cxt);

  function fromDef(name) {
    if (syn.definedBy.indexOf(name) > -1) return;
    var def = setup[name] instanceof Definition ? setup[name] : jsBinder.loadDef(name);
    def.requires.forEach(fromDef);
    def.buildSyntax(syn);
    def.initialize(binder);
    syn.definedBy.push(name);
  }

  fromDef('default');

  Object.keys(setup).forEach(fromDef);

  return binder;
}


/**
 * Handles the definition initialization passed to the jsBinder factory,
 * allows zero or more binder definitions to be specified
 * by the definition instance or definition name (using #loadDef)
 *
 * A set of definitions can be provided as an array.
 * This function is recursive when handling collections
 *
 * @param  {Object} defs  The definition setup map
 * @param  {mixed} init   The arguments to extract a set of definitions out of
 */
function _handleInit(defs, init) {
  if (init instanceof Definition) {
    defs[init.name] = init;
  } else
  if (typeof init === 'string') {
    defs[init] = jsBinder.loadDef(init);
  } else
  if (init instanceof Array) {
    init.forEach(_handleInit.bind(null, defs));
  }
}


// Export API
module.exports = jsBinder;