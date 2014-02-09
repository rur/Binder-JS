var p = require("../lib/parser");

describe("parser", function() {
  beforeEach(function() {
    parser = new p.Parser(test, parse);
  });

  it("should pass the test function to itself", function() {
    expect(parser.test).toBe(test);
  });

  describe("#parse", function() {
    it("should return a promise", function(done) {
      var prom = parser.parse();
      prom.then(function (data) {
        expect(data).toEqual("abc");
        done();
      });
    });

    it("should notify of errors", function(done) {
      parser = new p.Parser(test, function () {
        this.reject("some error message");
      })
      var prom = parser.parse();
      prom.then(null, function (data) {
        expect(data).toEqual("some error message");
        done();
      });
    });

    it("should allow a parser delay resolving the promise", function(done) {
      parser = new p.Parser(test, function () {
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
      parser = new p.Parser(test, function () {
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

function test () {
  return true;
}
function parse () {
  return "abc";
}