var index = require("../index");
var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Rule = require("../lib/rule");

describe("define", function() {
  it("should create a new definition object", function() {
    expect(index.define("something")).toEqual(jasmine.any(Definition));
  });

  it("should provide the definition with a ref to dep", function() {
    var dep = index.define("depDef");
    expect(index.define("test", ["depDef"]).deps).toContain(dep);
  });

  it("should throw an error if the base definition name doesn't exist", function() {
    expect(function () {
      index.define("test", ["typo"]);
    }).toThrow("Binder definition 'typo' not found");
  });
});

describe("create", function() {
  it("should create a binder instance", function() {
    expect(index.create("test")).toEqual(jasmine.any(Binder));
  });
});

describe("rule", function() {
  it("should create a new rule", function() {
    expect(index.rule({})).toEqual(jasmine.any(Rule));
  });
});