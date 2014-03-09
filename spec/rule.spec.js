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
    var condition, parse;
    beforeEach(function() {
      condition = function() {};
      parse = function() {};
    });

    it("should register a new parser with the context", function() {
      rule.parse(condition, parse);

      expect(parsers[0].condition).toBe(condition);
      expect(parsers[0].parse).toBe(parse);
    });

    it("should allow you to add a read function manually", function() {
      rule.parse(condition).read(parse);

      expect(parsers[0].condition).toBe(condition);
      expect(parsers[0].parse).toBe(parse);
    });

    it("should allow you to define a predicate and task manually", function() {
      rule.parse.when(condition).read(parse);

      expect(parsers[0].condition).toBe(condition);
      expect(parsers[0].parse).toBe(parse);
    });
  });

  describe("#filter", function() {
    it("should add a filter", function() {
      function filter () {}
      rule.filter(filter);
      expect(filters[0]).toBe(filter);
    });
  });

  xdescribe("#definePredicate", function() {

  });

  xdescribe("#defineProcess", function() {

  });
});