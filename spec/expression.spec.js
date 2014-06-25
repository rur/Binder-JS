var Expression = require('../lib/expression');

describe("Expression", function () {
  var expr;
  beforeEach(function () {
    expr = new Expression();
  });

  it("should be defined", function () {
    expect(expr).toBeDefined();
  });

  it("should have a calls array", function () {
    expect(expr.commands).toEqual([]);
  });

  it("should have a command object", function () {
    expect(expr.command).toBeDefined();
  });

  describe("#addWords", function () {
    beforeEach(function () {
      expr.addWords(['test']);
    });

    it("should have defined the words on the command", function () {
      expect(expr.command.hasOwnProperty('test')).toBeTruthy();
    });

    it("should register the word as a command", function () {
      expr.command.test();
      expect(expr.commands[0].name).toEqual('test');
    });

    it("should allow commands to be chained", function () {
      expr.command.test.test;
      expect(expr.commands[1].name).toEqual("test");
    });

    it("should save args", function () {
      expr.command.test(1, 2, 3);
      expect(expr.commands[0].args).toEqual([1,2,3]);
    });

    it("should throw an error if the set property fails", function () {
      expect(function () {
        expr.addWords(['name']);
      }).toThrow("BinderJS Expression: Unable to define the word: 'name'");
    });
  });
});