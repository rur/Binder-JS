var Syntax = require('./syntax');

/**
 * The context is used to hold parsing state
 *
 * @constructor
 */
function Context(syntax_, init) {
  // zero values:
  var syntax = syntax_ || new Syntax(),
      filters = [],
      parsers = [],
      route = [];

  if (typeof init === 'object' && init !== null) {
    filters = 'filters' in init ? init.filters : filters;
    parsers = 'parsers' in init ? init.parsers : parsers;
    route =   'route'   in init ? init.route   : route;
  }
  // following properties are not writable or enumerable
  Object.defineProperty(this, 'syntax', {
    value: syntax
  });
  Object.defineProperty(this, 'filters', {
    value: filters
  });
  Object.defineProperty(this, 'parsers', {
    value: parsers
  });
  Object.defineProperty(this, 'route', {
    value: route
  });
}

/**
 * Create a child context with a copy of itself
 *
 * @param {string} name The name of the child
 * @return {Context} A duplicate of this context
 */
Context.prototype.child = function (name) {
  var child = new Context(
    this.syntax,
    {
      filters: this.filters.slice(),
      parsers: this.parsers.slice(),
      route: this.route.concat(name || '.')
    }
  );
  var parent = this;
  Object.keys(parent).forEach(function (name) {
    child[name] = parent[name];
  });
  return child;
};

////////////////
// Export
////////////////

module.exports = Context;