var scanner = require("../lib/scanner");
var path = require("path");
var fs = require("fs");


describe("scanner", function() {
  var fp;
  beforeEach(function() {
    fp = path.resolve(__dirname, "fixtures/test.txt");
  });

  it("should take a context and return the parsed data", function(done) {
    scanner.scan(fp ,{}, function (error, data) {
      expect(error).toBeNull();
      expect(data).toBeNull();
      done();
    });
  });

  xit("should get data from a file", function(done) {
    scanner.scan(fp, {
      parsers: [{
        test: function () {
          return true;
        },
        parse: function (file_path) {
          var parser = this;
          fs.readFile(file_path, function (err, data) {
            if (err) {
              parser.error(err);
              return;
            };
            parser.resolve(data);
            done();
          });
          return this.promise;
        }
      }]
    },
    // handler
    function (err, data) {
      expect(data).toEqual("this is a test file");
    })
  });
});