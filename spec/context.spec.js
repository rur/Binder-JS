var Context = require("../lib/context");
var Syntax = require("../lib/syntax");
var when = require("when");

describe("Context", function () {
  var cxt;
  beforeEach(function () {
    cxt = new Context({mock: 'syntax'}, [], []);
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

  describe("#dup", function () {
    var dup;
    beforeEach(function () {
      cxt.parsers.push({mock: "parser"});
      dup = cxt.dup();
    });

    it("should create Context instance", function () {
      expect(dup).toEqual(jasmine.any(Context));
    });

    it("should copy the filters array", function () {
      expect(dup.filters[0]).toBe(cxt.filters[0]);
    });

    it("should allow the filters to be appended to independently", function () {
      dup.filters.push("test");
      expect(cxt.filters).not.toContain("test");
    });

    it("should copy the parsers array", function () {
      expect(dup.parsers[0]).toBe(cxt.parsers[0]);
    });

    it("should allow the parsers to be appended to independently", function () {
      dup.parsers.push("test");
      expect(cxt.parsers).not.toContain("test");
    });

    it("should copy fields applied", function () {
      expect(dup.test).toEqual("value");
    });
  });
});