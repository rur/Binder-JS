function Definition (name, deps) {
  this.name = name;
  this.deps = deps;
  this.parsers = {};
  this.tests = {};
  this.inits = [];
}

Definition.prototype = {
  preParser: function (name, base, func) {
    if (typeof base === "function") {
      func = base;
      base = undefined;
    }
    this.parsers[name] = {name: name, base: base, parser: func};
  },
  predicate: function (name, func) {
    this.tests[name] = {name: name, test: func};
  },
  init: function (func) {
    this.inits.push(func);
  }
};

module.exports = Definition;