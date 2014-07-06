var when = require("when");
var Definition = require("../definition");

/**
 * Configure the default binder definition
 *
 * @param  {Definition} def The default binder definition
 */
module.exports = function createDefault() {

  var def = new Definition("default");

  // ----------
  // Conditions
  // ----------
  def.condition("always", function () { return true; });

  def.condition("route", function (cxt, pth, route) {
    if (typeof route !== "string" || !(cxt.route instanceof Array)) {
      return false;
    }
    return route === cxt.route.join("/");
  });


  // --------------
  // Parse Handlers
  // --------------
  def.parser("ignore", function () {
    return when.reject();
  });

  return def;
};