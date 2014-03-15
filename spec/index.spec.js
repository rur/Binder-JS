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
  var binder;
  beforeEach(function() {
    index.define("test")
      .parser("readTest", function (path) {
        return path + " test read";
      })
      .condition("truthy", function () {
        return true;
      });
    binder = index.create("test");
  });

  it("should create a binder instance", function() {
    expect(binder).toEqual(jasmine.any(Binder));
  });

  it("have added a parsers condition term", function() {
    expect(binder.parse.truthy).toEqual(jasmine.any(Function));
  });

  it("should have added parser handler term", function() {
    expect(binder.parse.readTest).toEqual(jasmine.any(Function));
  });

  it("should error if the definition wasn't found", function() {
    expect(function () {
      index.create("unknown");
    }).toThrow("Cannot create binder, no definition was found with the name: 'unknown'");
  });
});

describe("rule", function() {
  it("should create a new rule", function() {
    expect(index.rule({})).toEqual(jasmine.any(Rule));
  });
});