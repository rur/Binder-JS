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

});