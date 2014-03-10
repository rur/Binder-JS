var Syntax = require("./syntax");

function Definition (name, deps) {
  this.name = name;
  this.deps = deps || [];
  this.parsers = {};
  this.conditions = {};
  this.inits = [];
}

Definition.prototype = {
  parser: function (name, base, func) {
    if (typeof base === "function") {
      func = base;
      base = undefined;
    }
    this.parsers[name] = {name: name, base: base, parser: func};
  },
  condition: function (name, func) {
    this.conditions[name] = {name: name, test: func};
  },
  init: function (func) {
    this.inits.push(func);
  },
  buildSyntax: function () {
    var syntax = new Syntax();
    var defs = this.deps.concat(this);
    for (var i = 0; i < defs.length; i++) {
      __extend(syntax.conditions, defs[i].conditions);
      __extend(syntax.parsers, defs[i].parsers);
    }
    return syntax;
  }
};

module.exports = Definition;

/////////////////
// Private
/////////////////

function __extend (dest, src) {
  Object.getOwnPropertyNames(src).forEach(function (name) {
    dest[name] = src[name];
  });
  return dest;
}