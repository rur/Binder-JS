var Binder = require("./lib/binder");
var Context = require("./lib/context");
var Syntax = require("./lib/syntax");
var Definition = require("./lib/definition");

// binders
// require('./lib/binders/fs-reader');

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
    return require("./lib/binders/" + name)();
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
      cxt = new Context(syn, [], []),
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
 * A set of definitions can be provided as an array or hash by def
 * name. This function is recursive when handling collections
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
  } else
  if (init instanceof Object) {
    Object.keys(init).forEach(function (key) {
      _handleInit(defs, init[key]);
    });
  }
}


// Export API
module.exports = jsBinder;