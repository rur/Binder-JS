var mkdefault = require('../../lib/binders/default');
var Definition = require("../../lib/definition");

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
      var index = require("../../index");
      var def = index.define('test');
      def.parser("test", function () {
        return "test parser";
      });
      binder = index(def);
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