var index = require("../index");
var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Rule = require("../lib/rule");

describe("define", function() {
  it("should create a new definition object", function() {
    expect(index.define("something")).toEqual(jasmine.any(Definition));
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