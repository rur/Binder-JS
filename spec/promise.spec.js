var p = require("../lib/promise");


describe("promise", function() {
  var ctrl, promise;
  beforeEach(function() {
    ctrl = new p.PromiseCtrl("Test promise");
    promise = ctrl.promise;
  });

  it("should create the controller", function() {
    expect(ctrl).toBeDefined();
  });

  it("should create the promise", function() {
    expect(promise).toBeDefined();
  });

  it("should give the promise a name", function() {
    expect(promise.name).toEqual("Test promise");
  });

  describe("calling handlers", function() {
    var res, rej;
    beforeEach(function() {
      res = jasmine.createSpy("Promise resolve handler");
      rej = jasmine.createSpy("Promise reject handler");
    });

    describe("that were registered beforehand", function() {
      beforeEach(function() {
        promise.then(res, rej);
      });
      it("should call resolve handler", function() {
        ctrl.resolve("test");
        expect(res).wasCalledWith("test");
      });

      it("should call reject handler", function() {
        ctrl.reject("test");
        expect(rej).wasCalledWith("test");
      });
    });

    describe("handlers registered late", function() {
      it("should call resolve handler", function() {
        ctrl.resolve("test");
        promise.then(res, rej);
        expect(res).wasCalledWith("test");
      });

      it("should call resolve handler", function() {
        ctrl.reject("test");
        promise.then(res, rej);
        expect(rej).wasCalledWith("test");
      });
    });
  });
});