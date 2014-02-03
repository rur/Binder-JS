var b = require("../lib/binder");
var path = require("path");


describe("binder", function() {
  var binder;
  beforeEach(function() {
    binder = new b.Binder();
  });

  it("should parse an individual file", function (done) {
    binder.compile({
      path: path.resolve(__dirname, "fixtures/test.txt"),
      handler: function (errors, data) {
        expect(data).toEqual("this is a test file");
        done();
      }
    });
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