var c = require("../lib/context");

describe(c.DefaultContext, function() {
  var cxt;
  beforeEach(function() {
    cxt = new c.DefaultContext();
  });

  it("should have an array of filters", function() {
    expect(cxt.filters).toEqual([]);
  });

  it("should have an array of parsers", function() {
    expect(cxt.parsers).toEqual([]);
  });
});