var Binder = require("../lib/binder");
var scanner = require("../lib/scanner");

describe("Binder", function() {
  var binder;
  beforeEach(function() {
    binder = new Binder({mock: "context", filters: [], parsers: []});
  });

  it("should create a binder", function() {
    expect(binder).toBeDefined();
  });

  it("should add the context object to itself", function() {
    expect(binder.context.mock).toEqual("context");
  });

  describe("extending Rule", function() {
    it("should register filters", function() {
      function mock () {};
      binder.filter(mock);
      expect(binder.context.filters).toContain(mock);
    });

    it("should create parser expressions", function() {
      var exp = {
        someCondition: jasmine.createSpy("someCondition"),
        someParse: jasmine.createSpy("someParse")
      };
      exp.someCondition.andReturn(exp);
      exp.someParse.andReturn(exp);
      binder.context.createParserExpr = function () {
        return exp;
      }
      binder.parse.someCondition("abc").someParse("def");
      expect(exp.someCondition).wasCalledWith("abc");
      expect(exp.someParse).wasCalledWith("def");
    });
  });

  describe("#compile", function() {
    var dup;
    beforeEach(function() {
      binder.compileTimeout = 123;
      spyOn(scanner, "scan");
    });

    it("should call scan", function() {
      binder.compile("some/path");
      expect(scanner.scan).wasCalledWith(binder.context, "some/path", 123);
    });
  });
});