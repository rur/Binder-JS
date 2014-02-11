var c = require("../lib/context");

describe(c.BinderContext, function() {
  var cxt;
  beforeEach(function() {
    cxt = new c.BinderContext();
  });

  it("should have an array of parsers", function() {
    expect(cxt.parsers).toEqual([]);
  });
});