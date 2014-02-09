var scanner = require("../lib/scanner");
var p = require("../lib/parser");
var path = require("path");
var fs = require("fs");


describe("scanner", function() {
  var fp;
  beforeEach(function() {
    fp = path.resolve(__dirname, "fixtures/test.txt");
  });

  it("should read a file", function(done) {
    fs.readFile(fp, "utf-8", function (err, data) {
      expect(data).toEqual("this is a test file");
      done();
    });
  });

  it("should take a context and return the parsed data", function(done) {
    scanner.scan(fp ,{}, function (error, data) {
      expect(error).toBe("No parser found");
      expect(data).not.toBeDefined();
      done();
    });
  });


  it("should get the data from the parser function", function() {
    var handler = jasmine.createSpy("Scan file handler");
    scanner.scan(fp, {
        parsers: [
        new p.Parser(function test () {
            return false;
          }, function parse (file_path) {
            return "something went wrong";
          }),
        new p.Parser(function test () {
            return true;
          }, function parse (file_path) {
            return "some data";
          })
        ]

      },
      handler);
    expect(handler).wasCalledWith(null, "some data");
  });

  it("should get data from a file", function(done) {
    scanner.scan(fp, {
      parsers: [
        new p.Parser(function () {
          return true;
        },
        function (file_path) {
          var parser = this;
          try {
            fs.readFile(file_path, "utf-8", function (err, data) {
              if (err) {
                parser.reject(err);
                return;
              };
              parser.resolve(data);
            });
          } catch (er) {
            parser.reject("Error reading file: "+er);
          }
          return this.promise;
        })
      ]
    },
    // handler
    function (err, data) {
      expect(data).toEqual("this is a test file");
      expect(err).toBeNull();
      done();
    });
  });
});