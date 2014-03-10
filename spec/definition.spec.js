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
    var spy, pDef;
    beforeEach(function() {
      spy = jasmine.createSpy("Pre Parser");
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
      expect(pDef.parser).toBe(spy);
    });

    it("should capture two parameter only call", function() {
      var spy2 = jasmine.createSpy("Second Pre Parser");
      def.parser("test_2", spy2);
      expect(def.parsers.test_2.parser).toBe(spy2);
    });
  });

  describe("#condition", function() {
    var spy;
    beforeEach(function() {
      spy = jasmine.createSpy("Test Predicate");
      def.condition("tester", spy);
    });

    it("should add a condition", function() {
      expect(def.conditions.tester.test).toBe(spy);
    });
  });

  describe("init", function() {
    it("should add an init function", function() {
      var spy = jasmine.createSpy("init");
      def.init(spy);
      expect(def.inits[0]).toBe(spy);
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