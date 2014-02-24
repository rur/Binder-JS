var Rule = require("../lib/rule");

describe("rule", function() {
  var rule, cxt, parsers, filters;
  beforeEach(function() {
    parsers = [];
    filters = [];
    cxt = {
      filters: filters,
      parsers: parsers
    };
    rule = new Rule(cxt);
  });

  it("should assign a context to itself", function() {
    expect(rule.context).toBe(cxt);
  });

  describe("#parse", function() {
    it("should register a new parser with the context", function() {
      function test () {
        // body...
      }
      function parse () {
        // body...
      }
      rule.parse(test, parse);

      expect(parsers[parsers.length - 1].test).toBe(test);
      expect(parsers[parsers.length - 1]._parse).toBe(parse);
    });
  });
});