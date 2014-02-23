var scanner = require("../lib/scanner");
var p = require("../lib/parser");
var path = require("path");
var fs = require("fs");


describe("scanner#scanFile", function() {
  var fp;
  beforeEach(function() {
    fp = path.resolve(__dirname, "fixtures/test.txt");
  });

  describe("parsing", function() {
    it("should take a context and return the parsed data", function(done) {
      scanner.scanFile(fp, {filters: [], parsers: []})
        .then(null, function (error) {
          expect(error).toBe("No parser found");
          done();
        });
    });

    it("should get the data from the parser function", function() {
      var handler = jasmine.createSpy("Scan file handler");
      scanner.scanFile(fp, {
          filters: [],
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
      scanner.scanFile(fp, {
        filters: [],
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
      scanner.scanFile(fp, {
        filters: [],
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

    it("should test last in parsers first", function() {
      var cx = {
        filters: [],
        parsers: [
          new p.Parser(jasmine.createSpy("true test"), jasmine.createSpy("target parser")),
          new p.Parser(jasmine.createSpy("false test"))
        ]
      };
      cx.parsers[0].test.andReturn(true);
      scanner.scanFile(fp, cx);
      expect(cx.parsers[1].test).wasCalled();
    });
  });

  describe("filters", function() {
    var filter, cxt, parse;
    beforeEach(function() {
      filter = jasmine.createSpy("Filter");
      parse = jasmine.createSpy("Parser");
      cxt = {
        filters: [filter],
        parsers: [new p.Parser(function () { return true; }, parse)]
      };
    });

    it("should call a filter on a file", function() {
      scanner.scanFile(fp, cxt);
      expect(filter).wasCalledWith(fp, cxt);
    });

    it("should trigger an error", function() {
      var rejSpy = jasmine.createSpy("Error handler");
      filter.andCallFake(function () {
        this.reject("test error");
      });
      scanner.scanFile(fp, cxt).then(null, rejSpy);
      expect(rejSpy).wasCalledWith("test error");
      expect(parse).not.toHaveBeenCalled();
    });

    it("should cause file to be ignored", function() {
      var resSpy = jasmine.createSpy("Resolve Spy");
      filter.andCallFake(function () {
        this.reject();
      });
      scanner.scanFile(fp, cxt).then(null, resSpy);
      expect(resSpy).toHaveBeenCalledWith(undefined);
      expect(parse).not.toHaveBeenCalled();
    });
  });

  describe("errors", function() {
    it("should timeout", function(done) {
      scanner.scanFile(fp, {filters: [], parsers: [
        new p.Parser(function () { return true; }, function () {
          return this.promise;
        })
      ]}, 10).then(null, function (err) {
        expect(err).toEqual("File scan timed out after 10 msec");
        done();
      });
    });
  });
});