var path = require("path");
var d_fault = require("../lib/default");
var Definition = require("../lib/definition");
var Context = require("../lib/context");
var Binder = require("../lib/binder");

describe("addDefaultDefinition", function() {
  var def;
  beforeEach(function() {
    def = new Definition("default");
    d_fault(def);
  });

  it("should add an ignore parse handler", function() {
    expect(def.parsers.ignore.name).toEqual("ignore");
  });

  it("should have an always condition", function() {
    expect(def.conditions.always.name).toEqual("always");
  });
});

describe("parsing", function() {
  var binder, res, rej, cxt;
  beforeEach(function() {
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

  describe("defined filters", function() {
    it("should get the file info", function(done) {
      var spy = jasmine.createSpy("Filter Spy");
      spy.andCallFake(function (pth, cxt) {
        done();
        expect(cxt.file.ext).toEqual(".skip");
      });
      binder.filter(spy);
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip"));
    });

    it("should handle errors in defined filters", function(done) {
      var err = new Error("test error");
      binder.filter(function() {
        throw err;
      });
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip")).then(null, function (reason) {
        done();
        expect(reason).toBe(err);
      });
    });
  });

  describe("Null Parser", function(done) {
    it("should ignore a file it doesn't recognize", function(done) {
      binder.compile(path.resolve(__dirname, "fixtures/nestedData/someFile.skip")).then(
        getFailSpy(this, done, "resolve"),
        function (reason) {
          expect(reason).toBeUndefined();
          done();
        });
    });
  });

  describe(".txt Parser", function() {
    it("should parse a txt file", function (done) {
      var spec = this;
      binder.compile(path.resolve(__dirname, "fixtures/test.txt")).then(function(reason) {
        done();
        expect(reason).toEqual("this is a test file");
      }, getFailSpy(this, done, "reject"));
    });
  });
});