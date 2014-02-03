var binder = require("../lib/binder");
var path = require("path");


describe("binder", function() {
  it("should parse an individual file", function (done) {
    binder.compile({
      path: path.resolve(__dirname, "fixtures/test.txt"),
      data: function (errors, data) {
        expect(data).toEqual("this is a test file");
        done();
      }
    });
  });
});