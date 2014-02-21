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

    describe("null handlers", function() {
      beforeEach(function() {
        promise.then();
      });

      it("should ignore null resolve handler", function() {
        expect(function () {
          ctrl.resolve();
        }).not.toThrow("TypeError: undefined is not a function");
      });

      it("should ignore null resolve handler", function() {
        expect(function () {
          ctrl.reject();
        }).not.toThrow("TypeError: undefined is not a function");
      });
    });
  });

  describe("promise#chain", function() {
    var ctrl, ctrl2, p1Data, finalProm;
    beforeEach(function() {
      ctrl2 = p1Data = null;
      ctrl = new p.PromiseCtrl("Test Promise");
      finalProm = ctrl.promise.chain(function (data) {
        p1Data = data;
        ctrl2 = new p.PromiseCtrl("Sub Test Promise");
        return ctrl2.promise;
      });
    });

    it("should chain two promises together", function(done) {
      ctrl.resolve("test");
      ctrl2.resolve(p1Data+" plus sub");
      finalProm.then(function (data) {
        expect(data).toEqual("test plus sub");
        done();
      });
    });

    it("should reject from origin", function(done) {
      ctrl.reject("test");
      finalProm.then(null, function (data) {
        expect(data).toEqual("test");
        done();
      });
    });

    it("should reject from second", function(done) {
      ctrl.resolve("test");
      ctrl2.reject(p1Data + " was rejected the second time");
      finalProm.then(null, function (data) {
        expect(data).toEqual("test was rejected the second time");
        done();
      })
    });
  });

});