var Context = require("../lib/context");
var Syntax = require("../lib/syntax");
var p = require("../lib/promise");

describe("Context", function() {
  var cxt;
  beforeEach(function() {
    cxt = new Context();
    cxt.test = "value";
  });

  it("should have an array of filters", function() {
    expect(cxt.filters).toEqual(jasmine.any(Array));
  });

  it("should have an array of parsers", function() {
    expect(cxt.parsers).toEqual(jasmine.any(Array));
  });

  describe("#dup", function() {
    var dup;
    beforeEach(function() {
      dup = cxt.dup();
    });

    it("should create Context instance", function() {
      expect(dup).toEqual(jasmine.any(Context));
    });

    it("should copy the filters array", function() {
      expect(dup.filters[0]).toBe(cxt.filters[0]);
    });

    it("should allow the filters to be appended to independently", function() {
      dup.filters.push("test");
      expect(cxt.filters).not.toContain("test");
    });

    it("should copy the parsers array", function() {
      expect(dup.parsers[0]).toBe(cxt.parsers[0]);
    });

    it("should allow the parsers to be appended to independently", function() {
      dup.parsers.push("test");
      expect(cxt.parsers).not.toContain("test");
    });

    it("should copy fields applied", function() {
      expect(dup.test).toEqual("value");
    });
  });

  describe("#createParserExpr", function() {
    var expr, syx;
    beforeEach(function() {
      syx = new Syntax;
      cxt._syntax = syx;
    });

    describe("adding basic parser", function() {
      function cond () {};
      function parse () {};
      beforeEach(function() {
        expr = cxt.createParserExpr();
        expr.when(cond).parseFile(parse);
      });

      it("should add a new parser", function() {
        expect(cxt.parsers.length).toEqual(1);
      });

      it("should have added the condition to the parser", function() {
        expect(cxt.parsers[0].condition).toBe(cond);
      });

      it("should have added the parse handler to the parser", function() {
        expect(cxt.parsers[0].parse).toBe(parse);
      });

      it("should error without a condition", function() {
        expect(function() {
          expr = cxt.createParserExpr();
          expr.parseFile();
        }).toThrow("Cannot create a parser rule without a condition");
      });
    });

    describe("multiple conditions", function() {
      var first, second;
      beforeEach(function() {
        expr = cxt.createParserExpr();
        first = jasmine.createSpy("first");
        second = jasmine.createSpy("second");
        expr.when(first).when(second).parseFile(function() {});
      });

      it("should still create a parser", function() {
        expect(cxt.parsers.length).toEqual(1);
      });

      it("should call the first", function() {
        cxt.parsers[0].condition("path", cxt);
        expect(first).wasCalledWith("path", cxt);
      });

      it("should call the second", function() {
        first.andReturn(true);
        cxt.parsers[0].condition("path", cxt);
        expect(second).wasCalledWith("path", cxt);
      });

      it("should be true", function() {
        first.andReturn(true);
        second.andReturn(true);
        expect(cxt.parsers[0].condition("path", cxt)).toBeTruthy();
      });
    });

    describe("defined syntax", function() {
      describe("conditions", function() {
        var test;
        beforeEach(function() {
          test = jasmine.createSpy("Test Condition");
          test.andReturn(true);
          syx.conditions["test"] = {
            name: "test",
            func: test
          };
          expr = cxt.createParserExpr();
        });

        it("should add the test custom condition", function() {
          expr.test().parseFile();
          cxt.parsers[0].condition("path", cxt);
          expect(test).wasCalledWith("path", cxt, []);
        });

        it("should chain user boolean function", function() {
          var spy = jasmine.createSpy("User Test Func");
          spy.andReturn(true);
          expr.test(spy).parseFile();
          expect(cxt.parsers[0].condition("path", cxt)).toBeTruthy();
          expect(spy).wasCalledWith("path", cxt);
        });

        it("should pass arguments to the condition function", function() {
          expr.test("hello").parseFile();
          expect(cxt.parsers[0].condition("path", cxt)).toBeTruthy();
          expect(test).wasCalledWith("path", cxt, ["hello"]);
        });
      });

      describe("parsers", function() {
        var read;
        beforeEach(function() {
          read = jasmine.createSpy("Read Test Parser");
          read.andReturn("was read");
          syx.parsers["readTest"] = {
            name: "readTest",
            func: read
          }
          expr = cxt.createParserExpr();
        });

        it("should add the readTest custom parser", function() {
          expr.when(noop).readTest();
          expect(cxt.parsers.length).toEqual(1);
        });

        it("should call the read handler", function() {
          expr.when(noop).readTest();
          p.callAsync(cxt.parsers[0].parse, "path", cxt);
        });

        it("should pass on arguments", function() {
          expr.when(noop).readTest("hello");
          p.callAsync(cxt.parsers[0].parse, "path", cxt);
          expect(read).wasCalledWith("path", cxt, ["hello"]);
        });

        it("should return what the parser returns", function(done) {
          expr.when(noop).readTest();
          p.callAsync(cxt.parsers[0].parse, "path", cxt).then(function(data) {
            expect(data).toEqual("was read");
            done();
          });
        });

        it("should allow the user define an after parser", function(done) {
          expr.when(noop).readTest(function(data) {
            return data + " and added too";
          });
          p.callAsync(cxt.parsers[0].parse, "path", cxt).then(function (data) {
            expect(data).toEqual("was read and added too");
            done();
          });
        });

        it("should chain promises", function(done) {
          read.andCallFake(function () {
            this.resolve("promise read data");
            return this.promise;
          });

          expr.when(noop).readTest(function (data) {
            setTimeout(this.handle(function() {
              this.resolve(data + " and added too!")
            }), 10);
            return this.promise;
          });

          p.callAsync(cxt.parsers[0].parse, "path", cxt).then(function (data) {
            expect(data).toEqual("promise read data and added too!");
            done();
          });
        });
      });
    });
  });
});

function noop () {
  "pass";
}