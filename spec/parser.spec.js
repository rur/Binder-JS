var Parser = require("../lib/parser");

describe("parser", function() {
  var condition, parse;
  beforeEach(function() {
    condition = function () {};
    parse = function () {};
    parser = new Parser(condition, parse);
  });

  it("should pass the condition function to itself", function() {
    expect(parser.condition).toBe(condition);
  });

  it("should pass the parse function to itself", function() {
    expect(parser.parse).toBe(parse);
  });
});