var Context = require("../lib/context");
var Syntax = require("../lib/syntax");
var when = require("when");

describe("Context", function () {
  var cxt;
  beforeEach(function () {
    cxt = new Context({mock: 'syntax'}, {
      filters: [],
      parsers: [],
      route: []
    });
    cxt.test = "value";
  });

  describe("native fields", function () {

    it("should have an array of filters", function () {
      expect(cxt.filters).toEqual(jasmine.any(Array));
    });

    it("should have an array of parsers", function () {
      expect(cxt.parsers).toEqual(jasmine.any(Array));
    });

    it("should have a mock syntax", function () {
      expect(cxt.syntax).toEqual({mock: "syntax"});
    });

    it("should not be enumerable ", function () {
      expect(Object.keys(cxt)).toEqual(['test']);
    });

    it("should not allow those properties to be overloaded", function () {
      cxt.syntax = "anything else";
      expect(cxt.syntax).not.toEqual("anything else");
    });
  });

  describe("#child", function () {
    var child;
    beforeEach(function () {
      cxt.parsers.push({mock: "parser"});
      child = cxt.child();
    });

    it("should create Context instance", function () {
      expect(child).toEqual(jasmine.any(Context));
    });

    it("should copy the filters array", function () {
      expect(child.filters[0]).toBe(cxt.filters[0]);
    });

    it("should allow the filters to be appended to independently", function () {
      child.filters.push("test");
      expect(cxt.filters).not.toContain("test");
    });

    it("should copy the parsers array", function () {
      expect(child.parsers[0]).toBe(cxt.parsers[0]);
    });

    it("should allow the parsers to be appended to independently", function () {
      child.parsers.push("test");
      expect(cxt.parsers).not.toContain("test");
    });

    it("should copy fields applied", function () {
      expect(child.test).toEqual("value");
    });
  });
});