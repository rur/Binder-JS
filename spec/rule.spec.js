var Rule = require("../lib/rule");

describe("rule", function() {
  var rule, cxt, expr;
  beforeEach(function() {
    expr = {
      when: jasmine.createSpy("test condition"),
      parseFile: jasmine.createSpy("read parse handler")
    };
    expr.when.andReturn(expr);
    expr.parseFile.andReturn(expr);
    cxt = {
      filters: [],
      createParserExpr: function () {
        return expr;
      },
    };
    rule = new Rule(cxt);
  });


  describe("#parse", function() {
    function condit () {}
    function parse () {}

    it("should complete the expression", function() {
      rule.parse(condit, parse);
      expect(expr.when).wasCalledWith(condit);
      expect(expr.parseFile).wasCalledWith(parse);
    });

    it("should complete the expression using statement syntax", function() {
      rule.parse.when(condit).parseFile(parse);
      expect(expr.when).wasCalledWith(condit);
      expect(expr.parseFile).wasCalledWith(parse);
    });
  });

  describe("#filter", function() {
    it("should add a filter", function() {
      function filter () {}
      rule.filter(filter);
      expect(cxt.filters[0]).toBe(filter);
    });
  });
});