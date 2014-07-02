var Parser = require("./parser");
var when = require("when");
//
var dup_exclude = ["filters", "parsers"];

/**
 * The context is used to hold parsing state
 *
 * @constructor
 */
function Context () {
  this.filters = [];
  this.parsers = [];
}

/**
 * Create a deepish copy of itself
 *
 * @return {Context} A duplicate of this context
 */
Context.prototype.dup = function() {
  var dup = new Context();
  var cxt = this;
  dup.filters = cxt.filters.slice();
  dup.parsers = cxt.parsers.slice();
  Object.keys(cxt).forEach(function (name) {
    if (dup_exclude.indexOf(name) === -1) {
      dup[name] = cxt[name];
    }
  });
  return dup;
};

////////////////
// Export
////////////////

module.exports = Context;