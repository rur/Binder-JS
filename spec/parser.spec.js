var Parser = require("../lib/parser");

describe("parser", function() {
  var condition, parse;
  beforeEach(function() {
    condition = function () {};
    parse = function () {};
    parser = new Parser(condition, parse);
  });

  it("should create a proc from the condition function", function() {
    expect(parser.condition[0]).toBe(condition);
  });

  it("should create a proc from the parse function", function() {
    expect(parser.parse[0]).toBe(parse);
  });
});