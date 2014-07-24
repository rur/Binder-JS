var path = require("path");
var fs = require("fs");
var Definition = require("../../lib/definition");
var Context = require("../../lib/context");
var Binder = require("../../lib/binder");
var index = require("../../index");

var fsReader = require('../../lib/binders/fs-reader');

var fixturesDir = path.resolve(__dirname, "../fixtures");

describe("binders/fs-reader", function () {

  var def;
  beforeEach(function () {
    def = fsReader();
  });

  it("should create a definition", function () {
    expect(def).toEqual(jasmine.any(Definition));
  });

  describe("conditions", function() {
    it("should add an ignore parse handler", function () {
      expect(def.parsers.readUTF.name).toEqual("readUTF");
    });

    it("should have a file condition", function () {
      expect(def.conditions.file.name).toEqual("file");
    });

    describe("route", function() {
      var binder;
      beforeEach(function() {
        var cxt = new Context();
        cxt._syntax = def.buildSyntax();
        binder = new Binder(cxt);
        def.initialize(binder);
      });

      it("should select by route", function (done) {
        binder.parse
          .route("./otherSubDir/sibling/*")
          .fileExt(".txt")
          .readUTF(function (data) {
            return data + " with more!";
          });
        binder.compile(path.resolve(fixturesDir, "nestedData/")).then(function (data) {
          expect(data.otherSubDir.sibling["test.txt"]).toEqual("data file with more!");
          done();
        },
        getFailSpy(this, done, "reject"));

      });
    });
  });

  describe("parsing", function () {
    var binder, res, rej, cxt;
    beforeEach(function () {
      binder = index(def);
      //
      res = jasmine.createSpy("Resolve Handler");
      rej = jasmine.createSpy("Reject Handler");
    });

    it("should create a new binder", function () {
      expect(binder).toEqual(jasmine.any(Binder));
    });

    describe("defined filters", function () {
      describe("file info", function () {
        it("should get the file info", function (done) {
          var spy = jasmine.createSpy("Filter Spy");
          spy.andCallFake(function (pth, cxt) {
            expect(cxt.file.ext).toEqual(".skip");
            expect(cxt.file.name).toEqual("someFile.skip");
            expect(cxt.file.path).toContain("/fixtures/nestedData/someFile.skip");
            done();
          });
          binder.filter(spy);
          binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip"));
        });

        it("should reject with an error if a value is not a valid path", function (done) {
          binder.compile("some/invalid/path")
            .then(getFailSpy(this, done, "resolve"), function (reason) {
              expect(reason.toString()).toEqual("Error: ENOENT, stat 'some/invalid/path'");
            }).then(done, done);
        });

        it("should ignore a value that is not a path", function (done) {
          binder.compile({mock: "value"})
            .then(getFailSpy(this, done, "resolve"), function (reason) {
              expect(reason).toBeUndefined();
              done();
            });
        });
      });

      describe("route", function () {
        it("should start as a dot", function (done) {
          binder.filter(function (fp, cx) {
            done();
            expect(cx.route).toEqual(['.']);
          });
          binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip"));
        });

        it("should add a dir name to the route", function (done) {
          binder.filter(function (fp, cx) {
            if (cx.file.name == "subDir") {
              expect(cx.route).toEqual([".", "subDir"]);
              done();
            }
          });
          binder.compile(path.resolve(fixturesDir, "nestedData/")).catch(getFailSpy(this, done, 'reject'));
        });

        it("should add manage route in sub folders children", function (done) {
          binder.filter(function (fp, cx) {
            if (cx.file.name === "siblingRoute.txt") {
              done();
              expect(cx.route.join("/")).toEqual("./otherSubDir/sibling copy 2/siblingRoute.txt");
            }
          });
          binder.compile(path.resolve(fixturesDir, "nestedData/"));
        });
      });

      it("should handle errors in filter function", function (done) {
        var err = new Error("test error");
        binder.filter(function () {
          throw err;
        });
        binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip"))
          .then(
            getFailSpy(this, done, 'resolve'),
            function (reason) {
              done();
              expect(reason.toString()).toEqual("Error: test error");
            });
      });

      describe("compile file size limit", function () {
        it("should have added a fsLimit object", function () {
          expect(binder.context.fileScanLimit.soFar).toBe(0);
        });

        it("should have a high limit", function () {
          expect(binder.context.fileScanLimit.max).toBeGreaterThan(10E5);
        });

        it("should allow the limit to be lowered", function (done) {
          binder.context.fileScanLimit.max = 10;
          binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip"))
            .then(getFailSpy(this, done, "resolve"), function (reason) {
              if (!(reason instanceof Error)) {
                done("limit was not reached");
                return;
              };
              expect(reason.toString()).toEqual("Error: File Scan limit reached");
              done();
            })
        });
      });
    });

    describe("Null Parser", function (done) {
      it("should ignore a file it doesn't recognize", function (done) {
        binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip")).then(
          getFailSpy(this, done, "resolve"),
          function (reason) {
            expect(reason).toBeUndefined();
            done();
          });
      });
    });

    describe(".txt Parser", function () {
      it("should parse a txt file", function (done) {
        var spec = this;
        binder.compile(path.resolve(fixturesDir, "test.txt")).then(function (reason) {
          done();
          expect(reason).toEqual("this is a test file");
        }, getFailSpy(this, done, "reject"));
      });

      it("should allow a new rule be defined with an after handler", function (done) {
        binder.parse.fileExt(".skip").readUTF(function (data) {
          return data + "; until this custom parser was added!";
        });
        binder.compile(path.resolve(fixturesDir, "nestedData/someFile.skip")).then(function (data) {
          done();
          expect(data).toEqual("unknown file; until this custom parser was added!");
        }, getFailSpy(this, done, "reject"));
      });
    });

    describe("folder parser", function () {
      it("should parse a folders data", function (done) {
        binder.compile(path.resolve(fixturesDir, "simpleDir/")).then( function (data) {
          done();
          expect(data).toEqual({
            "test.txt": "this is a test file in a folder"
          });
        }, getFailSpy(this, done, "reject"));
      });

      it("should handle empty folders", function (done) {
        var spec = this;
        fs.mkdirSync(path.resolve(fixturesDir, "emptyDir/"));

        function cleanUp() {
          done();
          fs.rmdirSync(path.resolve(fixturesDir, "emptyDir/"));
        }

        binder.compile(path.resolve(fixturesDir, "emptyDir/")).then( function (data) {
          cleanUp();
          expect(data).toEqual({});
        }, function (reason) {
          cleanUp();
          spec.fail("failed to compile empty directory, reason: " + reason);
        });
      });

      it("should handle a null directory", function (done) {
        binder.compile(path.resolve(fixturesDir, "nullDir/")).then( function (data) {
          done();
          expect(data).toEqual({});
        }, getFailSpy(this, done, "reject"));
      });

      describe("nested data", function () {
        var compiled;
        beforeEach(function () {
          compiled = binder.compile(path.resolve(fixturesDir, "nestedData/"));
        });

        it("should parse a nested dir", function (done) {
          compiled.then(function (data) {
                  done();
                  expect(data.subDir).toEqual({"test.txt": "this is another text file inside a sub directory"});
                }, getFailSpy(this, done, "reject"));
        });

        it("should skip unknown file type", function (done) {
          compiled.then(function (data) {
                  done();
                  expect(data["someFile.skip"]).toBeUndefined();
                }, getFailSpy(this, done, "reject"));
        });
      });
    });
  });
});