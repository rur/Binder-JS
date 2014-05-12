var scanner = require("../lib/scanner");
var Parser = require("../lib/parser");
var path = require("path");
var fs = require("fs");
var when = require('when');
var whennode = require('when/node');


describe("scanner#scanFile", function() {
  var fp;
  beforeEach(function() {
    fp = path.resolve(__dirname, "fixtures/test.txt");
  });

  describe("parsing", function() {
    it("should take a context and return the parsed data", function (done) {
      scanner.scanFile(fp, {filters: [], parsers: []})
        .then(
          getFailSpy(this, done, 'resolve'),
          function (error) {
            expect(error).toBe("No parser found");
            done();
          });
    });

    it("should get the data from the parser function", function (done) {
      scanner.scanFile(fp, {
          filters: [],
          parsers: [
          new Parser(function test () {
              return false;
            }, function parse (file_path) {
              return "something went wrong";
            }),
          new Parser(function test () {
              return true;
            }, function parse (file_path) {
              return "some data";
            })
          ]
        }).then(function (data) {
          expect(data).toEqual("some data");
          done();
        }, function (reason) {
          expect(reason).toEqual("the is not reason for this to happen!");
          done();
        });
    });

    it("should get data from a file", function (done) {
      scanner.scanFile(fp, {
        filters: [],
        parsers: [
          new Parser(function () {
            return true;
          },
          function (file_path) {
            return whennode.call(fs.readFile, file_path, "utf-8");
          })
        ]
      }).then(function (data) {
        expect(data).toEqual("this is a test file");
        done();
      }, getFailSpy(this, done, "reject"));
    });

    it("should pass a file read error onto the reject handler", function (done) {
      scanner.scanFile(fp, {
        filters: [],
        parsers: [
          new Parser(function () {
            return true;
          },
          function (file_path) {
            return whennode.call(fs.readFile, "non-existent-file.txt", "utf-8");
          })
        ]
      }).then(null, function (data) {
        expect(data.toString()).toEqual("Error: ENOENT, open 'non-existent-file.txt'");
        done();
      });
    });

    it("should test last in parsers first", function (done) {
      var spy = jasmine.createSpy("false test");
      var cx = {
        filters: [],
        parsers: [
          new Parser(function () { return true }, function () { return "data" }),
          new Parser(spy)
        ]
      };
      scanner.scanFile(fp, cx).then(function (d) {
        expect(d).toEqual("data");
        expect(spy).wasCalled();
        done();
      });
    });
  });

  describe("filters", function() {
    var filter, cxt, parse;
    beforeEach(function() {
      filter = jasmine.createSpy("Filter");
      parse = jasmine.createSpy("Parser");
      cxt = {
        filters: [filter],
        parsers: [new Parser(function () { return true; }, parse)]
      };
    });

    it("should call a filter on a file", function (done) {
      scanner.scanFile(fp, cxt).then(function () {
        expect(filter).wasCalledWith(fp, cxt);
        done();
      }, getFailSpy(this, done, "reject"));
    });

    it("should reject the scanner promise", function() {
      var rejSpy = jasmine.createSpy("Error handler");
      cxt.filters[0] = function () {
        return when.reject("test error");
      };
      scanner.scanFile(fp, cxt).then(null, function (reason) {
        expect(reason.toString()).toEqual("test error");
        expect(parse).not.toHaveBeenCalled();
        done();
      });
    });

    it("should handle an error", function (done) {
      var rejSpy = jasmine.createSpy("Error handler");
      cxt.filters[0] = function () {
        throw "some error";
      };
      scanner.scanFile(fp, cxt).then(null, function (reason) {
        expect(reason.toString()).toEqual("some error");
        expect(parse).not.toHaveBeenCalled();
        done();
      });
    });

    it("should cause file to be ignored", function (done) {
      var resSpy = jasmine.createSpy("Resolve Spy");
      filter.andCallFake(function () {
        return when.reject();
      });
      scanner.scanFile(fp, cxt).then(null, function (reason) {
        expect(reason).not.toBeDefined();
        expect(parse).not.toHaveBeenCalled();
        done();
      });
    });

    it("should call filters in the order they were defined", function (done) {
      var spy = jasmine.createSpy("Second Filter");
      filter.andCallFake(function (p, c) {
        c.test = "value";
      });
      spy.andCallFake(function(p, c) {
        done();
        expect(c.test).toEqual("value");
      });
      cxt.filters.push(spy);
      scanner.scanFile(fp, cxt);
    });

    it("should handle filters asynchronously", function (done) {
      var spy = jasmine.createSpy("Second Filter");
      filter.andCallFake(function (p, c) {
        return when().delay(10).then(function () {
          c.test = "value";
        });
      });
      spy.andCallFake(function(p, c) {
        expect(c.test).toEqual("value");
        done();
      });
      cxt.filters.push(spy);
      scanner.scanFile(fp, cxt);
    });
  });

  describe("errors", function() {
    it("should timeout", function (done) {
      scanner.scanFile(fp, {filters: [], parsers: [
        new Parser(function () { return true; }, function () {
          return when.defer().promise;
        })
      ]}, 10).then(null, function (err) {
        expect(err.toString()).toEqual("Error: timed out after 10ms");
        done();
      });
    });
  });
});