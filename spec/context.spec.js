var Context = require("../lib/context");
var Syntax = require("../lib/syntax");

describe("Context", function() {
  var cxt;
  beforeEach(function() {
    cxt = new Context();
    cxt.test = "value";
  });

  it("should have an array of filters", function() {
    expect(cxt.filters).toEqual(jasmine.any(Array));
  });

  it("should have an array of parsers", function() {
    expect(cxt.parsers).toEqual(jasmine.any(Array));
  });

  describe("#dup", function() {
    var dup;
    beforeEach(function() {
      dup = cxt.dup();
    });

    it("should create Context instance", function() {
      expect(dup).toEqual(jasmine.any(Context));
    });

    it("should copy the filters array", function() {
      expect(dup.filters[0]).toBe(cxt.filters[0]);
    });

    it("should allow the filters to be appended to independently", function() {
      dup.filters.push("test");
      expect(cxt.filters).not.toContain("test");
    });

    it("should copy the parsers array", function() {
      expect(dup.parsers[0]).toBe(cxt.parsers[0]);
    });

    it("should allow the parsers to be appended to independently", function() {
      dup.parsers.push("test");
      expect(cxt.parsers).not.toContain("test");
    });

    it("should copy fields applied", function() {
      expect(dup.test).toEqual("value");
    });
  });

  describe("#createParserExpr", function() {
    var expr, syx;
    beforeEach(function() {
      syx = new Syntax;
      cxt._syntax = syx;
    });

    describe("adding basic parser", function() {
      function cond () {};
      function parse () {};
      beforeEach(function() {
        expr = cxt.createParserExpr();
        expr.when(cond).then(parse);
      });

      it("should add a new parser", function() {
        expect(cxt.parsers.length).toEqual(1);
      });

      it("should have added the condition to the parser", function() {
        expect(cxt.parsers[0].condition).toBe(cond);
      });

      it("should have added the parse handler to the parser", function() {
        expect(cxt.parsers[0].parse).toBe(parse);
      });

      it("should error without a condition", function() {
        expect(function() {
          expr = cxt.createParserExpr();
          expr.then();
        }).toThrow("Cannot add a parser without a condition");
      });
    });

    describe("multiple conditions", function() {
      var first, second;
      beforeEach(function() {
        expr = cxt.createParserExpr();
        first = jasmine.createSpy("first");
        second = jasmine.createSpy("second");
        expr.when(first).when(second).then(function() {});
      });

      it("should still create a parser", function() {
        expect(cxt.parsers.length).toEqual(1);
      });

      it("should call the first", function() {
        cxt.parsers[0].condition("path", cxt);
        expect(first).wasCalledWith("path", cxt);
      });

      it("should call the second", function() {
        first.andReturn(true);
        cxt.parsers[0].condition("path", cxt);
        expect(second).wasCalledWith("path", cxt);
      });

      it("should be true", function() {
        first.andReturn(true);
        second.andReturn(true);
        expect(cxt.parsers[0].condition("path", cxt)).toBeTruthy();
      });
    });

    describe("defined syntax", function() {

    });
  });
});