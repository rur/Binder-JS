var when = require("when");
var minimatch = require("minimatch");
var bjs = require("../../");

/**
 * Configure the default binder definition
 *
 * @param  {Definition} def The default binder definition
 */
module.exports = function createDefault() {

  var def = bjs.define("default");

  // ----------
  // Conditions
  // ----------
  def.condition("always", function () { return true; });
  def.condition("when", function () { return true; });
  def.condition("route", function (pth, cxt, route) {
    if (typeof route !== "string" || !(cxt.route instanceof Array)) {
      return false;
    }
    return minimatch(cxt.route.join("/"), route);
  });


  // --------------
  // Parse Handlers
  // --------------
  /**
   * Skip subject
   */
  def.parser("ignore", function () {
    return when.reject();
  });
  /**
   * Blank handler which passes on the subject passed in
   *
   * This is intended for use where the user only wants
   * their own function to handle the subject
   */
  def.parser("handle", function (subj) { return subj; });

  return def;
};