var when = require("when");

var Context = require("../lib/context");
var Binder = require("../lib/binder");
var Syntax = require("../lib/syntax");
var Parser = require("../lib/parser");
var scanner = require("../lib/scanner");
var proc = require("../lib/proc");
var BinderException = require('../lib/exception').BinderException;

describe("Binder", function() {
  var binder, syntax, testSpy;

  beforeEach(function() {
    syntax = new Syntax();
    testSpy = jasmine.createSpy("test condition");
    syntax.parsers.action = {
      name: "action",
      proc: proc(function () {})
    };
    syntax.conditions.test = {
      name: "test",
      proc: proc(testSpy)
    };
    binder = new Binder(new Context(syntax));
  });

  it("should create a binder", function() {
    expect(binder).toBeDefined();
  });

  it("should add the context object to itself", function() {
    expect(binder.context).toEqual(jasmine.any(Context));
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
    var cxt, result;
    beforeEach(function() {
      result = when.defer();
      spyOn(scanner, "scan");
      scanner.scan.andCallFake(function (s, c, to) {
        cxt = c;
        return result.promise;
      })
    });

    it("should call scan", function() {
      binder.compileTimeout = 123;
      binder.compile("some/path");
      expect(scanner.scan).wasCalledWith("some/path", cxt, 123);
    });

    it("should append a path to the route", function () {
      binder.compile("some/path", "path");
      expect(cxt.route).toEqual(["path"]);
    });

    it("should append a dot if route is not specified", function () {
      binder.compile("some/path");
      expect(cxt.route).toEqual(["."]);
    });

    describe("parsers", function () {
      var parser;

      beforeEach(function () {
        // define parser
        binder
          .parse
            .test(1,[2,3], function testFn() {})
            .action(function actionFn() {});
        binder.compile("something");
        parser = cxt.parsers[0];
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

      it("should have given the parser a statement", function () {
        expect(parser.statement).toEqual('test(1,[2,3],testFn()).action(actionFn())');
      });

      it("should catch an invalid expression", function () {
        binder.parse.action;
        expect(function () {
          binder.compile("FAIL");
        }).toThrow("Cannot compile parser, invalid rule statement[1]: 'action'");
      });

      it("should catch an invalid word", function () {
        binder.parse.action.test;
        expect(function () {
          binder.compile("FAIL");
        }).toThrow("Cannot compile parser, invalid rule statement[1]: 'action test'");
      });

      it("should add default params to procs", function () {
        parser.condition[0]('test', {mock: "context"});
        expect(testSpy).wasCalledWith('test', {mock: "context"}, 1, [2,3]);
      });
    });

    describe("nesting", function () {

      describe("with exception", function () {
        var excp;
        beforeEach(function() {
          excp = new BinderException('some reason', 'test', {mock: "context"});
          result.reject(excp);
        });

        it("should have the reason", function (done) {
          binder.compile('something')
            .catch(function (excp) {
              expect(excp.reason).toEqual('some reason');
            })
            .done(done, done);
        });

        it("should have the context", function (done) {
          binder.compile('something')
            .catch(function (excp) {
              expect(excp.context).toEqual({mock: "context"});
            })
            .done(done, done);
        });

        it("should have the parent contexts", function (done) {
          binder.compile('something')
            .catch(function (excp) {
              expect(excp.parents[0]).toEqual(jasmine.any(Context));
            })
            .done(done, done);
        });
      });

      describe("with reason", function () {
        it("of error", function (done) {
          var err = new Error('test');
          result.reject(err);
          binder.compile('something')
            .catch(function (excp) {
              expect(excp.reason).toBe(err);
            })
            .then(done, done);
        });

        it("with the subject", function (done) {
          var err = new Error('test');
          result.reject(err);
          binder.compile('something')
            .catch(function (excp) {
              expect(excp.subject).toBe('something');
            })
            .then(done, done);
        });

        it("with the context", function (done) {
          var err = new Error('test');
          result.reject(err);
          binder.compile('something', 'test')
            .catch(function (excp) {
              expect(excp.context.route).toEqual(['test']);
            })
            .then(done, done);
        });

        it("of undefined", function (done) {
          result.reject();
          binder.compile('something')
            .catch(function (reason) {
              expect(reason).not.toBeDefined;
              done();
            })
            .then(done, done);
        });
      });
    });
  });
});
