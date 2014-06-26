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

  describe("#commandInterface", function () {
    var ci;

    beforeEach(function () {
      syntax.parsers["testParser"] = "something";
      syntax.conditions["testCond"] = "something else";
      ci = syntax.commandInterface();
    });

    it("should return an object", function () {
      expect(ci).toBeDefined();
    });

    it("should create an expression", function () {
      expect(Object.keys(ci.beginStatement())).toEqual(["testParser", "testCond"]);
    });

    it("should invoke a handler with the commands that were called", function (done) {
      var spy = function (cmnds) {
        expect(cmnds.map(function (c) {
          return c.name
        })).toEqual(["testCond", "testParser"]);
        done();
      };
      ci.onStatement(spy);
      ci.beginStatement().testCond.testParser;
    });

    it("should register args with commands", function (done) {
      var spy = function (cmnds) {
        expect(cmnds[1].args).toEqual(["a", "b", 123]);
        done();
      };
      ci.onStatement(spy);
      ci.beginStatement().testCond.testParser("a", "b", 123);
    });
  });
});