var Syntax = require("../lib/syntax");
var Expression = require("../lib/expression");


describe("Syntax", function() {
  var syntax;
  beforeEach(function() {
    syntax = new Syntax;
  });

  it("should create a syntax instance", function() {
    expect(syntax).toBeDefined();
  });

  it("should have an object for parsers", function() {
    expect(syntax.parsers).toEqual({});
  });

  it("should have an object for conditions", function() {
    expect(syntax.conditions).toEqual({});
  });

  describe("#getParser", function () {
    it("should get a parser", function () {
      syntax.parsers["test"] = "abc";
      expect(syntax.getParser("test")).toEqual("abc");
    });

    it("should throw an error", function () {
      expect(function () {
        syntax.getParser("test");
      }).toThrow("Unknown parser: 'test'");
    });
  });

  describe("#getCondition", function () {
    it("should get a parser", function () {
      syntax.conditions["test"] = "abc";
      expect(syntax.getCondition("test")).toEqual("abc");
    });

    it("should throw an error", function () {
      expect(function () {
        syntax.getCondition("test");
      }).toThrow("Unknown condition: 'test'");
    });
  });

});