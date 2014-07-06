var Definition = require("../lib/definition");
var Syntax = require("../lib/syntax");
var proc = require("../lib/proc");


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
      depDef.parser("depTestReader", function depTestReader() {});
      def = new Definition("test", [depDef]);
      def.condition("test", function() {});
      def.parser("testReader", 'depTestReader', function testReader() {});
      syn = def.buildSyntax();
    });

    it("should create syntax file", function() {
      expect(syn).toEqual(jasmine.any(Syntax));
    });

    describe("conditions", function () {

      it("should have own conditions", function() {
        expect(syn.conditions["test"].name).toEqual("test");
      });

      it("should have dependent conditions", function() {
        expect(syn.conditions["depTest"].name).toEqual("depTest");
      });

      it("should create a proc for its own condition", function () {
        expect(syn.conditions.test.proc.length).toEqual(1);
      });

      it("should have the default conditions", function () {
        expect(syn.conditions.always).toBeDefined();
      });
    });

    describe("parsers", function () {

      it("should have own parsers", function() {
        expect(syn.parsers["testReader"].name).toEqual("testReader");
      });

      it("should have dependent parsers", function() {
        expect(syn.parsers["depTestReader"].name).toEqual("depTestReader");
      });

      it("should have created a proc for the parser", function () {
        expect(syn.parsers.testReader.proc).toBeDefined();
      });

      it("should combine the base parsers into the proc", function () {
        expect(syn.parsers.testReader.proc.length).toEqual(2);
        expect(syn.parsers.testReader.proc[0]).toBe(depDef.parsers.depTestReader.func);
      });

      it("should have created a proc for the dep parsers", function () {
        expect(syn.parsers.depTestReader.name).toEqual("depTestReader");
      });

      it("should have the default parsers", function () {
        expect(syn.parsers.ignore).toBeDefined();
      });
    });
  });
});