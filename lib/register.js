var Definition = require("./definition");
var getDefault = require("./binders/default");

var definitions = {};

/**
 * Create a new binder syntax definition
 *
 * @param  {string}         name      The unique name of this Binder
 * @param  {array<string>}  depNames  Base definitions to extend
 * @return {Definition}   Binder definition object with which you can
 *                               now define syntax rules
 */
function register(name, depNames ) {
  var deps = [getDefault()], dep, dName;
  if (depNames instanceof Array) {
    for (var i = 0; i < depNames.length; i++) {
      deps.push(register.getDef(depNames[i]));
    }
  }
  var def = definitions[name] = new Definition(name, deps);
  return def;
}

register.hasBinder = function (name) {
  return definitions.hasOwnProperty(name);
};

register.getDef = function (name) {
  if (name === undefined) {
    return getDefault();
  }
  if (!register.hasBinder(name)) {
    throw new Error("Cannot create binder, no definition was found with the name: '" + name + "'");
  }
  return definitions[name];
};

module.exports = register;