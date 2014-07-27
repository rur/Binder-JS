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
    expect(def.requires).toEqual([]);
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

  it("should add required definitions array", function () {
    expect((new Definition('test', ['testDep'])).requires).toEqual(['testDep']);
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
  });

  describe("buildSyntax", function() {
    var depDef, syn;
    beforeEach(function() {
      def = new Definition("test", ['depDef']);
      def.condition("test", function() {});
      def.parser("testReader", 'depTestReader', function testReader() {});
      syn = new Syntax();
      syn.conditions.depTest = {name: 'depTest'};
      syn.parsers.depTestReader = {name: 'depTestReader', proc: function depTestReader() {}};
      def.buildSyntax(syn);
    });

    it("should create syntax object", function() {
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
        expect(syn.parsers.testReader.proc[0].name).toBe('depTestReader');
      });

      it("should have created a proc for the dep parsers", function () {
        expect(syn.parsers.depTestReader.name).toEqual("depTestReader");
      });

      it("should throw an error if they base parser doesn't exist", function () {
        def.parser('test2', 'unknownBase', function() {});
        expect(def.buildSyntax.bind(def, syn)).toThrow("test#test2: Base parser 'unknownBase' was not found");
      });
    });
  });
});