/**
 * The context is used to hold parsing state
 *
 * @constructor
 */
function Context(syntax, filters, parsers) {
  Object.defineProperty(this, 'syntax', {
    value: syntax
  });
  Object.defineProperty(this, 'filters', {
    value: filters
  });
  Object.defineProperty(this, 'parsers', {
    value: parsers
  });
}

/**
 * Create a shallow copy of itself
 *
 * @return {Context} A duplicate of this context
 */
Context.prototype.dup = function() {
  var dup = new Context(this.syntax, this.filters.slice(), this.parsers.slice());
  var cxt = this;
  Object.keys(cxt).forEach(function (name) {
    dup[name] = cxt[name];
  });
  return dup;
};

////////////////
// Export
////////////////

module.exports = Context;