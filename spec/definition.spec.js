var Definition = require("../lib/definition");
var Syntax = require("../lib/syntax");


describe("Definition", function() {
  var def;
  beforeEach(function() {
    def = new Definition("test");
  });

  it("should create a definition", function() {
    expect(def.name).toEqual("test");
  });

  it("should create an empty list of dependencies", function() {
    expect(def.deps).toEqual([]);
  });

  it("should have an object for parsers", function() {
    expect(def.parsers).toEqual({});
  });

  it("should have an object for conditions", function() {
    expect(def.conditions).toEqual({});
  });

  it("should have an array for init functions", function() {
    expect(def.inits).toEqual([]);
  });

  describe("#parser", function() {
    var spy, baseSpy, pDef;
    beforeEach(function() {
      spy = jasmine.createSpy("Pre Parser");
      baseSpy = jasmine.createSpy("Pre Parser Base");
      def.parser("base", spy);
      def.parser("test", "base", spy);
      pDef = def.parsers.test;
    });

    it("should add a parsers VO", function() {
      expect(pDef.name).toEqual("test");
    });

    it("should add a base parser field to parser VO", function() {
      expect(pDef.base).toEqual("base");
    });

    it("should add a base parser field to parser VO", function() {
      expect(pDef.func).toBe(spy);
    });

    it("should capture two parameter only call", function() {
      var spy2 = jasmine.createSpy("Second Pre Parser");
      def.parser("test_2", spy2);
      expect(def.parsers.test_2.func).toBe(spy2);
    });
  });

  describe("#getParser", function () {
    beforeEach(function () {
      def.parser("test", function () {
        "noop";
      });
    });

    it("should get a parser that it defines itself", function () {
      expect(def.getParser("test").name).toEqual("test");
    });

    it("should get a parsers from a dependency", function () {
      var def2 = new Definition("test2", [def]);
      expect(def2.getParser("test").name).toEqual("test");
    });
  });

  describe("#condition", function() {
    var spy;
    beforeEach(function() {
      spy = jasmine.createSpy("Test Predicate");
      def.condition("tester", spy);
    });

    it("should add a condition", function() {
      expect(def.conditions.tester.func).toBe(spy);
    });
  });

  describe("initializing binder", function() {
    var initl, binder;
    beforeEach(function() {
      binder = {mock: "binder"};
      initl = jasmine.createSpy("init");
      def.init(initl);
    });

    it("should add an init function", function() {
      expect(def.inits[0]).toBe(initl);
    });

    it("should run each initl function on supplied binder", function() {
      def.initialize(binder);
      expect(initl).wasCalledWith(binder);
    });

    it("should run dependent init functions first", function() {
      var sub = new Definition("sub", [def]);
      var initl2 = jasmine.createSpy("sub binder initl");
      sub.init(initl2);
      sub.initialize(binder);
      expect(initl).wasCalledWith(binder);
    });
  });

  describe("buildSyntax", function() {
    var depDef, syn;
    beforeEach(function() {
      depDef = new Definition("dep def");
      depDef.condition("depTest", function() {});
      depDef.parser("depTestReader", function() {});
      def = new Definition("test", [depDef]);
      def.condition("test", function() {});
      def.parser("testReader", function() {});
      syn = def.buildSyntax();
    });

    it("should create syntax file", function() {
      expect(syn).toEqual(jasmine.any(Syntax));
    });

    it("should provide it with the conditions", function() {
      expect(syn.conditions["test"].name).toEqual("test");
    });

    it("should extend dep' definition conditions", function() {
      expect(syn.conditions["depTest"].name).toEqual("depTest");
    });

    it("should provide it with parsers", function() {
      expect(syn.parsers["testReader"].name).toEqual("testReader");
    });

    it("should provide it with parsers", function() {
      expect(syn.parsers["depTestReader"].name).toEqual("depTestReader");
    });
  });
});