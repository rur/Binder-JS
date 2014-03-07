var Definition = require("../lib/definition");


describe("Definition", function() {
  var def;
  beforeEach(function() {
    def = new Definition("test", ["dep"]);
  });

  it("should create a definition", function() {
    expect(def.name).toEqual("test");
  });

  it("should store list of dependent definition names", function() {
    expect(def.deps).toEqual(["dep"]);
  });

  it("should have an object for parsers", function() {
    expect(def.parsers).toEqual({});
  });

  it("should have an object for predicates", function() {
    expect(def.tests).toEqual({});
  });

  it("should have an array for init functions", function() {
    expect(def.inits).toEqual([]);
  });

  describe("#preParser", function() {
    var spy, pDef;
    beforeEach(function() {
      spy = jasmine.createSpy("Pre Parser");
      def.preParser("test", "base", spy);
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
      def.preParser("test_2", spy2);
      expect(def.parsers.test_2.parser).toBe(spy2);
    });
  });

  describe("#predicate", function() {
    var spy;
    beforeEach(function() {
      spy = jasmine.createSpy("Test Predicate");
      def.predicate("tester", spy);
    });

    it("should add a predicate", function() {
      expect(def.tests.tester.test).toBe(spy);
    });
  });

  describe("init", function() {
    it("should add an init function", function() {
      var spy = jasmine.createSpy("init");
      def.init(spy);
      expect(def.inits[0]).toBe(spy);
    });
  });
});