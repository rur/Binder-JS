var Context = require("../lib/context");
var Syntax = require("../lib/syntax");
var when = require("when");

describe("Context", function () {
  var cxt;
  beforeEach(function () {
    cxt = new Context();
    cxt.test = "value";
  });

  it("should have an array of filters", function () {
    expect(cxt.filters).toEqual(jasmine.any(Array));
  });

  it("should have an array of parsers", function () {
    expect(cxt.parsers).toEqual(jasmine.any(Array));
  });

  describe("#dup", function () {
    var dup;
    beforeEach(function () {
      dup = cxt.dup();
    });

    it("should create Context instance", function () {
      expect(dup).toEqual(jasmine.any(Context));
    });

    it("should copy the filters array", function () {
      expect(dup.filters[0]).toBe(cxt.filters[0]);
    });

    it("should allow the filters to be appended to independently", function () {
      dup.filters.push("test");
      expect(cxt.filters).not.toContain("test");
    });

    it("should copy the parsers array", function () {
      expect(dup.parsers[0]).toBe(cxt.parsers[0]);
    });

    it("should allow the parsers to be appended to independently", function () {
      dup.parsers.push("test");
      expect(cxt.parsers).not.toContain("test");
    });

    it("should copy fields applied", function () {
      expect(dup.test).toEqual("value");
    });
  });
});