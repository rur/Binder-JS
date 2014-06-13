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
      expect(def.conditions.route.func("abc", {}, "test")).toBe(false);;
    });

    it("should match a route condition", function () {
      expect(def.conditions.route.func({route: ["test", "abc"] }, "abc", "test/abc")).toBe(true);;

    });
  });
});