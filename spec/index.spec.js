var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Context = require("../lib/context");
var index = require("../index");

xdescribe("index#create", function() {
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
    }).toThrow("No binder definition was found with the name: 'unknown'");
  });

  it("should apply definition init", function() {
    expect(binder.context.parsers.length).toBeGreaterThan(0);
  });

  it("should have default definition applied", function() {
    expect(binder.parse.ignore).toEqual(jasmine.any(Function));
  });
});

describe("jsBidner.define", function () {
  it("should create a definition object", function () {
    expect(index.define('test')).toEqual(jasmine.any(Definition));
  });

  it("should add dependent definitions", function () {
    var test = index.define('test');
    expect(index.define('test2', [test]).deps[0]).toBe(test);
  });
});

describe("jsBinder", function() {
  it("should create a binder from a context", function() {
    expect(index(new Context)).toEqual(jasmine.any(Binder));
  });

  it("should dup the context", function () {
    var cxt = new Context();
    var dupCxt = new Context();
    spyOn(cxt, 'dup').andReturn(dupCxt);
    expect(index(cxt).context).toBe(dupCxt);
    expect(cxt.dup).wasCalled();
  });
});
