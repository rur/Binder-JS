var Binder = require("../lib/binder");
var Parser = require("../lib/parser");
var s = require("../lib/scanner");
var path = require("path");
var fs = require("fs");

/*
  Binder Jasmine Specs
 */
describe("binder", function() {
  var binder;
  beforeEach(function() {
    binder = new Binder();
    configForTests(binder);
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
      binder.context.parsers.push(new Parser(function () {
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
        binder.context.parsers.push(new Parser(function () { return true; },
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
        binder.context.parsers.push(new Parser(function () { return true; },
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
          "test.txt": "this is a test file in a folder"
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
          "test.txt": "this is another text file inside a sub directory"
        });
        done();
      }, function (data) {
        spec.fail(data);
        done();
      });
    });

  });
});

///////////////////
//// Spec Helpers
//
// Add filters and parers for tests
function configForTests (binder) {
  // create file property in context
  binder.filter(function (pth, cxt) {
    fs.stat(pth, this.handle(function (err, stats) {
      if (err) {
        this.reject(err);
      } else {
        cxt.file = {
          isDir: stats.isDirectory(),
          ext: path.extname(pth),
        };
        this.resolve();
      }
    }));
    return this.promise;
  });
  // Null Parser
  binder.parse(function () {
      return true;
    }, function () {
      this.reject(); // skip
    });
  // UTF Parser
  binder.parse(function (_, cxt) {
      var fileTypes = [".txt", ".js"];
      return fileTypes.indexOf(cxt.file.ext) > -1;
    }, function (pth) {
      fs.readFile(pth, "utf-8", this.handle(function (err, data) {
        if (err) {
          this.reject(err);
          return;
        }
        this.resolve(data);
      }));
      return this.promise;
    });
  // Folder Parser
  binder.parse(function (_, cxt) {
      return cxt.file.isDir;
    }, function (pth, cxt) {
      var parser = this;
      fs.readdir(pth, this.handle(function (err, files) {
        var count, fileData = {};
        var subCxt, file;
        // handlers
        function makeFileResolver(file, f_cxt) {
          return parser.handle(function (data) {
            fileData[file] = data;
            if (--count === 0) {
              this.resolve(fileData);
            }
          });
        }
        function makeFileRejector(file, f_cxt) {
          return parser.handle(function (err) {
            count--;
            if (err !== void 0) {
              this.reject(err);
            }
          });
        }
        //
        if (err) {
          this.reject(err);
        } else {
          count = files.length;
          for (var i=0, len=count; i < len; i++) {
            subCxt = cxt.dup();
            file = files[i];
            s.scanFile(path.join(pth, file), subCxt).then(
              makeFileResolver(file, subCxt),
              makeFileRejector(file, subCxt)
            );
          }
        }
      }));
      return this.promise;
    });
}