var path = require("path");
var fs = require("fs");
var d_fault = require("../lib/default");
var Definition = require("../lib/definition");
var Context = require("../lib/context");
var Binder = require("../lib/binder");

describe("default", function () {
  var def;
  beforeEach(function () {
    def = new Definition("default");
    d_fault(def);
  });

  describe("conditions", function() {
    it("should add an ignore parse handler", function () {
      expect(def.parsers.ignore.name).toEqual("ignore");
    });

    it("should have an always condition", function () {
      expect(def.conditions.always.name).toEqual("always");
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
        binder.parse.route("otherSubDir/sibling").fileExt(".txt").readUTF(function (data) {
          return data + " with more!";
        });
        binder.compile(path.resolve(__dirname, "fixtures/nestedData/")).then(function (data) {
          done();
          expect(data.otherSubDir.sibling["test.txt"]).toEqual("data file with more!");
        }, getFailSpy(this, done, "reject"));
      });
    });
  });
});

describe("parsing", function () {
  var binder, res, rej, cxt;
  beforeEach(function () {
    cxt = new Context();
    var def = new Definition();
    d_fault(def);
    cxt._syntax = def.buildSyntax();
    binder = new Binder(cxt);
    def.initialize(binder);
    //
    res = jasmine.createSpy("Resolve Handler");
    rej = jasmine.createSpy("Reject Handler");
  });

  describe("defined filters", function () {
    describe("file info", function () {
      it("should get the file info", function (done) {
        var spy = jasmine.createSpy("Filter Spy");
        spy.andCallFake(function (pth, cxt) {
          done();
          expect(cxt.file.ext).toEqual(".skip");
          expect(cxt.file.name).toEqual("someFile.skip");
          expect(cxt.file.path).toContain("/fixtures/nestedData/someFile.skip");
        });
        binder.filter(spy);
        binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip"));
      });
    });

    describe("route", function () {
      it("should start as an empty array", function (done) {
        binder.filter(function (fp, cx) {
          done();
          expect(cx.route).toEqual([]);
        });
        binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip"));
      });

      it("should add a dir name to the route", function (done) {
        binder.filter(function (fp, cx) {
          if (cx.file.name == "subDir") {
            done();
            expect(cx.route).toEqual(["subDir"]);
          }
        });
        binder.compile(path.resolve(__dirname, "fixtures/nestedData/"));
      });

      it("should add manage route in sub folders children", function (done) {
        binder.filter(function (fp, cx) {
          if (cx.file.name === "siblingRoute.txt") {
            done();
            expect(cx.route.join("/")).toEqual("otherSubDir/sibling copy 2");
          }
        });
        binder.compile(path.resolve(__dirname, "fixtures/nestedData/"));
      });
    });

    it("should handle errors in defined filters", function (done) {
      var err = new Error("test error");
      binder.filter(function () {
        throw err;
      });
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip")).then(null, function (reason) {
        done();
        expect(reason).toBe(err);
      });
    });
  });

  describe("Null Parser", function (done) {
    it("should ignore a file it doesn't recognize", function (done) {
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip")).then(
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
      binder.compile(path.resolve(__dirname, "fixtures/test.txt")).then(function (reason) {
        done();
        expect(reason).toEqual("this is a test file");
      }, getFailSpy(this, done, "reject"));
    });

    it("should allow a new rule be defined with an after handler", function (done) {
      binder.parse.fileExt(".skip").readUTF(function (data) {
        return data + "; until this custom parser was added!";
      });
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip")).then(function (data) {
        done();
        expect(data).toEqual("unknown file; until this custom parser was added!");
      }, getFailSpy(this, done, "reject"));
    });
  });

  describe("folder parser", function () {
    it("should parse a folders data", function (done) {
      binder.compile(path.resolve(__dirname, "fixtures/simpleDir/")).then( function (data) {
        done();
        expect(data).toEqual({
          "test.txt": "this is a test file in a folder"
        });
      }, getFailSpy(this, done, "reject"));
    });

    it("should handle empty folders", function (done) {
      var spec = this;
      fs.mkdirSync(path.resolve(__dirname, "fixtures/emptyDir/"));

      function cleanUp () {
        done();
        fs.rmdirSync(path.resolve(__dirname, "fixtures/emptyDir/"));
      }

      binder.compile(path.resolve(__dirname, "fixtures/emptyDir/")).then( function (data) {
        cleanUp();
        expect(data).toEqual({});
      }, function (reason) {
        cleanUp();
        spec.fail("failed to compile empty directory, reason: " + reason);
      });
    });

    it("should handle a null directory", function (done) {
      binder.compile(path.resolve(__dirname, "fixtures/nullDir/")).then( function (data) {
        done();
        expect(data).toEqual({});
      }, getFailSpy(this, done, "reject"));
    });

    describe("nested data", function () {
      var compiled;
      beforeEach(function () {
        compiled = binder.compile(path.resolve(__dirname, "fixtures/nestedData/"));
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