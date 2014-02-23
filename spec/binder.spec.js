var b = require("../lib/binder");
var p = require("../lib/parser");
var path = require("path");


describe("binder", function() {
  var binder;
  beforeEach(function() {
    binder = new b.Binder();
  });

  describe("compiling a single file", function() {
    it("should parse an individual file", function (done) {
      binder.compile(path.resolve(__dirname, "fixtures/test.txt"))
      .then(function (data) {
        expect(data).toEqual("this is a test file");
        done();
      }, getFailSpy(this, done));

    });

    it("should parse another individual file", function (done) {
      binder.compile(path.resolve(__dirname, "fixtures/test_2.txt"))
      .then(function (data) {
        expect(data).toEqual("this is another test file");
        done();
      }, getFailSpy(this, done));
    });

    it("should timeout with a faulty parser", function(done) {
      binder.compileTimeout = 10; // just to make the test run faster
      binder.context.parsers.push(new p.Parser(function () {
        return true;
      }, function () {

        // Faulty parser. ie. it doesn't ever complete the promise
        return this.promise;
      }));
      binder.compile(path.resolve(__dirname, "fixtures/test_2.txt"))
        .then(null, function (data) {
          expect(data).toEqual("File scan timed out after 10 msec");
          done();
        });
    });

    it("should error with a faulty path", function(done) {
      binder.compile("non/existent/file.txt").then(null,
        function (data) {
          expect(data.toString()).toEqual("Error: ENOENT, stat 'non/existent/file.txt'");
          done();
        });
    });

    describe("faulty parser", function() {
      it("should catch and reject an error in a parser", function(done) {
        binder.context.parsers.push(new p.Parser(function () { return true; },
            function () {
              throw "error"
            }));
        binder.compile(path.resolve(__dirname, "fixtures/test.txt"))
        .then(null, function (err) {
          expect(err.toString()).toEqual("error");
          done();
        });
      });

      it("should catch and reject an error in a parser", function(done) {
        binder.context.parsers.push(new p.Parser(function () { return true; },
            function () {
              setTimeout(this.handle(function () {
                throw "some error";
              }), 10);
              return this.promise;
            }));
        binder.compile(path.resolve(__dirname, "fixtures/test.txt"))
        .then(null, function (err) {
          expect(err.toString()).toEqual("some error");
          done();
        });
      });
    });
  });

  describe("compiling a directory", function() {
    it("should parse a file in a directory", function(done) {
      var spec = this;
      binder.compile(path.resolve(__dirname, "fixtures/simpleDir/"))
      .then(function (data) {
        expect(data).toEqual({
          test: "this is a test file in a folder"
        });
        done();
      }, function (data) {
        spec.fail(data);
        done();
      });
    });

    it("should parse data in ", function(done) {
      var spec = this;
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/"))
      .then(function (data) {
        expect(data.subDir).toEqual({
          test: "this is another text file inside a sub directory"
        });
        done();
      }, function (data) {
        spec.fail(data);
        done();
      });
    });

  });

});