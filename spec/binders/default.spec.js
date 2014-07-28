var mkdefault = require('../../lib/binders/default');
var Definition = require("../../lib/definition");
var Syntax = require("../../lib/syntax");
var Context = require("../../lib/context");
var Binder = require("../../lib/binder");

describe("binders/default", function () {
  var def;
  beforeEach(function () {
    def = mkdefault();
  });

  it("should create a definition", function () {
    expect(def).toEqual(jasmine.any(Definition));
  });

  describe("route condition", function () {
    it("should test the route condition", function () {
      expect(def.conditions.route.func("abc", {}, "test")).toBe(false);
    });

    it("should match a route condition", function () {
      expect(def.conditions.route.func("abc", {route: ["test", "abc"] }, "test/*")).toBe(true);
    });
  });

  describe("in a binder", function () {
    var binder;
    beforeEach(function () {
      var syn = new Syntax(),
          cxt = new Context(syn, [], []);
      binder = new Binder(cxt);

      def.parser('test', function () {
        return 'test parser';
      });
      def.buildSyntax(syn);
      def.initialize(binder);
    });

    it("should have ignore command in the syntax", function () {
      expect(binder.parse.ignore).toEqual(jasmine.any(Function));
    });

    it("should work", function (done) {
      binder.parse.always().test();
      binder.compile("abc").then(function (data) {
        expect(data).toEqual("test parser");
        done();
      }, done);
    });

    describe("route", function () {
      beforeEach(function () {
        binder.context.route = ["a", 'b'];
      });

      it("should match a route glob", function (done) {
        binder.parse.route('**/c').test();
        binder.compile("a/b/c", "c").then(function (data) {
          expect(data).toEqual("test parser");
          done();
        }, done);
      });

      it("should chain route with another condition", function (done) {
        var spy = jasmine.createSpy().andReturn(true);
        binder.parse.route('a/b/c', spy).always().test();
        binder.compile("a/b/c", "c").then(function (data) {
          expect(spy).wasCalledWith("a/b/c", jasmine.any(Object));
          done();
        }, done);
      });
    });

  });
});