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
      })
      .init(function(binder) {
        binder.parse.truthy().readTest();
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

  it("should error if a specified definition wasn't found", function() {
    expect(function () {
      index.create("unknown");
    }).toThrow("Cannot create binder, no definition was found with the name: 'unknown'");
  });

  it("should create a default only binder", function() {
    binder = index.create();
    expect(binder.parse.readUTF).toEqual(jasmine.any(Function));
  });

  it("should apply definition init", function() {
    expect(binder.context.parsers.length).toBeGreaterThan(0);
  });

  it("should have default definition applied", function() {
    expect(binder.parse.readUTF).toEqual(jasmine.any(Function));
  });
});

describe("rule", function() {
  it("should create a new rule", function() {
    expect(index.rule({})).toEqual(jasmine.any(Rule));
  });
});

describe("scanFile", function () {
  var cxt, parser, filter;
  beforeEach(function () {
    parser = jasmine.createSpyObj("Parser", ["condition", "parse"]);
    parser.condition.andReturn(true);
    parser.parse.andReturn("some data");
    filter = jasmine.createSpy("Filter");
    cxt = {
      parsers: [parser],
      filters: [filter]
    };
  });

  it("should resolve with the raw data", function (done) {
    index.scanFile("some/path.test", cxt).then(function (data) {
      expect(data).toEqual("some data");
      done();
    }).catch(getFailSpy(this, done, "reject"));
  });

  it("should call the filter with the path and context", function (done) {
    index.scanFile("some/path.test", cxt).then(function (data) {
      expect(filter).wasCalledWith("some/path.test", cxt);
      done();
    }).catch(getFailSpy(this, done, "reject"));
  });
});