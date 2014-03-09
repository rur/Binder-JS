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
    return new Syntax();
  }
};

module.exports = Definition;