var Parser = require("../lib/parser");

describe("parser", function() {
  var condition, parse;
  beforeEach(function() {
    condition = function () {};
    parse = function () {};
    parser = new Parser(condition, parse);
  });

  it("should pass the condition function to itself", function() {
    expect(parser.condition).toBe(condition);
  });

  it("should pass the parse function to itself", function() {
    expect(parser.parse).toBe(parse);
  });

  xdescribe("#parse", function() {
    it("should return a promise", function(done) {
      var prom = parser.parse();
      prom.then(function (data) {
        expect(data).toEqual("abc");
        done();
      });
    });

    it("should notify of errors", function(done) {
      parser = new Parser(condition, function () {
        this.reject("some error message");
      })
      var prom = parser.parse();
      prom.then(null, function (data) {
        expect(data).toEqual("some error message");
        done();
      });
    });

    it("should allow a parser delay resolving the promise", function(done) {
      parser = new Parser(condition, function () {
        var parser = this;
        setTimeout(function() {
          parser.resolve("some data");
        }, 10);
        return this.promise;
      });
      var prom = parser.parse();
      prom.then(function (data) {
        expect(data).toEqual("some data");
        done();
      })
    });

    it("should allow a parser delay rejecting the promise", function(done) {
      parser = new Parser(condition, function () {
        var parser = this;
        setTimeout(function() {
          parser.reject("some error");
        }, 10);
        return this.promise;
      });
      var prom = parser.parse();
      prom.then(null, function (data) {
        expect(data).toEqual("some error");
        done();
      })
    });
  });
});

///////////
// Helpers
///////////

function condition () {
  return true;
}
function parse () {
  return "abc";
}