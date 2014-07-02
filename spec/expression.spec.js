var expression = require('../lib/expression');

describe("expression", function () {

  describe("commandInterface", function () {
    var expr, syntax;

    beforeEach(function () {
      syntax = {
        parsers: {
          testParser: "something"
        },
        conditions: {
          testCond: "something else"
        }
      };
      expr = expression.create(syntax);
    });

    it("should return an object", function () {
      expect(expr).toBeDefined();
    });

    it("should create a command interface", function () {
      expect(Object.keys(expr.command)).toEqual(["testParser", "testCond"]);
    });

    it("should invoke a handler with the commands that were called", function () {
      expr.command.testCond.testParser;
      expect(expr.commands[0].name).toEqual('testCond');
    });

    it("should register args with commands", function () {
      expr.command.testCond.testParser("a", "b", 123);
      expect(expr.commands[1].args).toEqual([ 'a', 'b', 123 ]);
    });

    it("should throw an error if a syntax has an invalid word", function () {
      syntax.parsers.name = "abc";
      expect(function () {
        expression.create(syntax);
      }).toThrow("BinderJS Expression: Unable to define the word: 'name'");
    });
  });
});
