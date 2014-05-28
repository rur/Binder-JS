var Definition = require("../lib/definition");
var Binder = require("../lib/binder");
var Rule = require("../lib/rule");
var register = require("../lib/register");

describe("register", function() {
  it("should create a new definition object", function() {
    expect(register("something")).toEqual(jasmine.any(Definition));
  });

  it("should provide the definition with a ref to dep", function() {
    var dep = register("depDef");
    expect(register("test", ["depDef"]).deps).toContain(dep);
  });

  it("should throw an error if the base definition name doesn't exist", function() {
    expect(function () {
      register("test", ["typo"]);
    }).toThrow("Cannot create binder, no definition was found with the name: 'typo'");
  });
});