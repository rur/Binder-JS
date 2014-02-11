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
    scanner.scan(fp ,{parsers: []}).then(null, function (error) {
      expect(error).toBe("No parser found");
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
      }).then(handler);
    expect(handler).wasCalledWith("some data");
  });

  it("should get data from a file", function(done) {
    scanner.scan(fp, {
      parsers: [
        new p.Parser(function () {
          return true;
        },
        function (file_path) {
          var parser = this;
          fs.readFile(file_path, "utf-8", function (err, data) {
            if (err) {
              parser.reject(err);
              return;
            };
            parser.resolve(data);
          });
          return this.promise;
        })
      ]
    }).then(function (data) {
      expect(data).toEqual("this is a test file");
      done();
    });
  });

  it("should pass a file read error onto the reject handler", function(done) {
    scanner.scan(fp, {
      parsers: [
        new p.Parser(function () {
          return true;
        },
        function (file_path) {
          var parser = this;
          fs.readFile("non-existent-file.txt", function (err, data) {
            if (err) {
              parser.reject(err);
              return;
            };
            parser.resolve(data);
          });
          return this.promise;
        })
      ]
    }).then(null, function (data) {
      expect(data.toString()).toEqual("Error: ENOENT, open 'non-existent-file.txt'");
      done();
    });
  });
});