var Rules = require("../lib/rules");

describe("rule", function() {
  it("should create a rule object", function() {
    expect((new Rules({}))).toBeDefined();
  });
});