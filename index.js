var Definition = require("./lib/definition");
var Binder = require("./lib/binder");
var Rule = require("./lib/rule");

var binder_js_api = {
  define: function (name) {
    return new Definition(name);
  },
  create: function (defName) {
    return new Binder();
  },
  rule: function (cxt) {
    return new Rule(cxt);
  }
};

module.exports = binder_js_api;