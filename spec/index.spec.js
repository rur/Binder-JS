var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Rule = require("../lib/rule");
var index = require("../index");

describe("index#create", function() {
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

  it("should create a basic binder", function () {
    expect(index.create()).toEqual(jasmine.any(Binder));
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

  it("should apply definition init", function() {
    expect(binder.context.parsers.length).toBeGreaterThan(0);
  });

  it("should have default definition applied", function() {
    expect(binder.parse.ignore).toEqual(jasmine.any(Function));
  });
});

describe("index#rule", function() {
  it("should create a new rule", function() {
    expect(index.rule({})).toEqual(jasmine.any(Rule));
  });
});

describe("scan", function () {
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
    index.scan("some/path.test", cxt).then(function (data) {
      expect(data).toEqual("some data");
      done();
    }).catch(getFailSpy(this, done, "reject"));
  });

  it("should call the filter with the path and context", function (done) {
    index.scan("some/path.test", cxt).then(function (data) {
      expect(filter).wasCalledWith("some/path.test", cxt);
      done();
    }).catch(getFailSpy(this, done, "reject"));
  });
});