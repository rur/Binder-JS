var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Context = require("../lib/context");
var index = require("../index");

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
  describe("create from definition", function () {
    var binder;
    beforeEach(function() {
      var def = index.define("test");
      def.parser("readTest", function (path) {
          return path + " test read";
        })
        .condition("truthy", function () {
          return true;
        })
        .init(function(binder) {
          binder.parse.truthy().readTest();
        });
      binder = index(def);
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
        index("unknown");
      }).toThrow("Binder setup must either be a definition or the context from another binder process. Given: (unknown)");
    });

    it("should apply definition init", function() {
      expect(binder.statements.length).toBeGreaterThan(0);
    });

    xit("should have default definition applied", function() {
      expect(binder.parse.ignore).toEqual(jasmine.any(Function));
    });
  });

  describe("create from context", function () {
    it("should create a binder from a context", function() {
      expect(index(new Context)).toEqual(jasmine.any(Binder));
    });
  });
});

describe("jsBinder.loadDef", function () {
  it("should load fs-reader", function () {
    expect(index.loadDef('fs-reader')).toEqual(jasmine.any(Definition));
  });
});
