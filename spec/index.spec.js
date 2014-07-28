var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Context = require("../lib/context");
var index = require("../index");

describe("jsBidner.define", function () {
  it("should create a definition object", function () {
    expect(index.define('test')).toEqual(jasmine.any(Definition));
  });

  it("should add dependent definitions", function () {
    var test2 = index.define('test2', ['test']);
    expect(test2.requires[0]).toEqual('test');
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

    it("should apply definition init", function() {
      expect(binder.statements.length).toBeGreaterThan(0);
    });

    it("should have default definition applied", function() {
      expect(binder.parse.ignore).toEqual(jasmine.any(Function));
    });
  });

  describe("create with multiple definitions", function () {
    var binder, tdef, t2def;
    beforeEach(function () {
      tdef = index.define('test');
      tdef.parser('test', function () {
        return "test parser";
      });
      t2def = index.define('test2', ['test']);
      t2def.condition('test2', function () { return true });
      t2def.parser('testExt', 'test', function (d) { return d + " and more!" });
      binder = index([t2def, tdef]);
    });

    it("should apply the test def", function () {
      expect(binder.parse.test).toEqual(jasmine.any(Function));
    });

    it("should apply the test2 def", function () {
      expect(binder.parse.test2).toEqual(jasmine.any(Function));
    });

    it("should allow sub def use parent for base of parsers", function () {
      // nasty but useful
      expect(binder.context.syntax.parsers.testExt.proc.length).toEqual(2);
    });

    it("should have the defined from list", function () {
      expect(binder.context.syntax.definedBy).toEqual([ 'default', 'test', 'test2' ]);
    });

    it("should complain if a required def is not there", function () {
      tdef.requires.push('unknown');
      expect(function () {
        index([t2def, tdef]);
      }).toThrow("Unable to load parser definition: 'unknown'");
    });

    it("should only initialize any definition once", function () {
      var odef = index.define('test2b', ['test']);
      var spy = jasmine.createSpy('init');
      tdef.init(spy);
      binder = index([tdef, odef, t2def, tdef]);
      expect(spy.callCount).toEqual(1);
    });
  });

  describe("create from context", function () {
    it("should create a binder from a context", function() {
      expect(index(new Context)).toEqual(jasmine.any(Binder));
    });
  });

  describe("create from a definition name", function () {
    it("should create a binder", function () {
      expect(index("fs-reader")).toEqual(jasmine.any(Binder));
    });

    it("should create a default binder", function () {
      expect(index()).toEqual(jasmine.any(Binder));
    });
  });
});

describe("jsBinder.loadDef", function () {
  it("should load fs-reader", function () {
    expect(index.loadDef('fs-reader')).toEqual(jasmine.any(Definition));
  });
});
