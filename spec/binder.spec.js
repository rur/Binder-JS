var b = require("../lib/binder");
var path = require("path");


describe("binder", function() {
  var binder, getFailSpy;
  beforeEach(function() {
    binder = new b.Binder();
    getFailSpy = function (test, msg, done) {
      var spy = jasmine.createSpy("FAIL");
      spy.andCallFake(function () {
        test.fail(msg);
        if (typeof done === "function") done();
      });
      return spy;
    }
  });

  it("should parse an individual file", function (done) {
    binder.compile({
      path: path.resolve(__dirname, "fixtures/test.txt")
    }).then(function (data) {
      expect(data).toEqual("this is a test");
      done();
    }, getFailSpy(this, "promise was rejected", done));
  });

  xit("should parse a file in a directory", function(done) {
    binder.compile({
      path: path.resolve(__dirname, "fixtures/simpleDir/"),
      handler: function (errors, data) {
        expect(data).toEqual({
          test: "this is a test file in a folder"
        });
        done();
      }
    });
  });
});