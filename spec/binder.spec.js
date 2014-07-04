var Binder = require("../lib/binder");
var Syntax = require("../lib/syntax");
var Parser = require("../lib/parser");
var scanner = require("../lib/scanner");
var proc = require("../lib/proc");

describe("Binder", function() {
  var binder, syntax;

  beforeEach(function() {
    syntax = new Syntax();
    syntax.parsers.action = {
      name: "action",
      proc: proc(function () {})
    };
    syntax.conditions.test = {
      name: "test",
      proc: proc(function () {})
    };
    binder = new Binder({
      mock: "context",
      filters: [],
      parsers: [],
      _syntax: syntax
    });
  });

  it("should create a binder", function() {
    expect(binder).toBeDefined();
  });

  it("should add the context object to itself", function() {
    expect(binder.context.mock).toEqual("context");
  });


  it("should register filters", function() {
    function mock () {};
    binder.filter(mock);
    expect(binder.context.filters).toContain(mock);
  });

  it("should have begin a parse statement", function () {
    expect(binder.parse.test).toEqual(jasmine.any(Function));
  });

  describe("#compile", function() {
    var dup;
    beforeEach(function() {
      spyOn(scanner, "scan");
    });

    it("should call scan", function() {
      binder.compileTimeout = 123;
      binder.compile("some/path");
      expect(scanner.scan).wasCalledWith(binder.context, "some/path", 123);
    });

    describe("parsers", function () {
      var parser;

      beforeEach(function () {
        // define parser
        binder
          .parse
            .test(1,2, function testFn() {})
            .action(function actionFn() {});
        binder.compile("something");
        parser = binder.context.parsers[0];
      });

      it("should create a parser", function () {
        expect(parser).toEqual(jasmine.any(Parser));
      });

      it("should have added the condition proc", function () {
        expect(parser.condition.length).toEqual(2);
      });

      it("should have added the parser proc", function () {
        expect(parser.parse.length).toEqual(2);
      });

      it("should catch an invalid expression", function () {
        binder.parse.action;
        expect(function () {
          binder.compile("FAIL");
        }).toThrow("Cannot compile parser, invalid rule statement[0]: 'action'");
      });

      it("should catch an invalid word", function () {
        binder.parse.action.test;
        expect(function () {
          binder.compile("FAIL");
        }).toThrow("Cannot compile parser, invalid rule statement[0]: 'action test'");
      });

      it("should add default params to procs", function () {
        expect(parser.condition.defaultParams).toEqual(['[data here]', '[context here]', 1, 2]);
      });
    });
  });
});