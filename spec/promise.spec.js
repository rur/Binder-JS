var p = require("../lib/promise");


describe("promise", function () {
  var ctrl, promise;
  beforeEach(function () {
    ctrl = new p.PromiseCtrl("Test promise");
    promise = ctrl.promise;
  });

  it("should create the controller", function () {
    expect(ctrl).toBeDefined();
  });

  it("should create the promise", function () {
    expect(promise).toBeDefined();
  });

  it("should give the promise a name", function () {
    expect(promise.name).toEqual("Test promise");
  });

  describe("calling then handlers:", function () {
    var res, rej;
    beforeEach(function () {
      res = jasmine.createSpy("Promise resolve handler");
      rej = jasmine.createSpy("Promise reject handler");
    });

    describe("that were registered beforehand", function () {
      beforeEach(function () {
        promise.then(res, rej);
      });
      it("should call resolve handler", function () {
        ctrl.resolve("test");
        expect(res).wasCalledWith("test");
      });

      it("should call reject handler", function () {
        ctrl.reject("test");
        expect(rej).wasCalledWith("test");
      });
    });

    describe("handlers registered late", function () {
      it("should call resolve handler", function () {
        ctrl.resolve("test");
        promise.then(res, rej);
        expect(res).wasCalledWith("test");
      });

      it("should call resolve handler", function () {
        ctrl.reject("test");
        promise.then(res, rej);
        expect(rej).wasCalledWith("test");
      });
    });

    describe("null handlers", function () {
      beforeEach(function () {
        promise.then();
      });

      it("should ignore null resolve handler", function () {
        expect(function () {
          ctrl.resolve();
        }).not.toThrow("TypeError: undefined is not a function");
      });

      it("should ignore null resolve handler", function () {
        expect(function () {
          ctrl.reject();
        }).not.toThrow("TypeError: undefined is not a function");
      });
    });

    describe("error handlers", function () {
      var spy;
      beforeEach(function() {
        spy = jasmine.createSpy();
      });

      it("should reject promise", function() {
        promise.then(function (data) {
          throw "something";
        }).then(null, spy);
        ctrl.resolve();
        expect(spy).wasCalledWith("something");
      });

      it("should allow an error to be thrown in the reject handler", function() {
        promise.then(null, function () {
          throw "something";
        });
        expect(function () {
          ctrl.reject("reason");
        }).toThrow("something");
      });
    });

    describe("chained handler", function () {
      it("should create a chained promise", function (done) {
        ctrl.resolve("test");
        promise.then(function (data) {
          return data+" some value";
        }).then(function (data) {
          expect(data).toEqual("test some value");
          done();
        });
      });
    });
  });

  describe("promise chaining", function () {
    var ctrl;
    beforeEach(function () {
      ctrl = new p.PromiseCtrl("Test Promise");
    });

    it("should chain two promises together", function (done) {
      ctrl.resolve("test");
      ctrl.promise.then(function (data) {
        this.resolve(data+" plus sub");
        return this.promise;
      }).then(function (data) {
        expect(data).toEqual("test plus sub");
        done();
      });
    });

    it("should reject from origin", function (done) {
      ctrl.reject("test");
      ctrl.promise.then().then(null, function (data) {
        expect(data).toEqual("test");
        done();
      });
    });

    it("should reject from second", function (done) {
      ctrl.resolve("test");
      ctrl.promise.then(function (data) {
        this.reject(data + " was rejected the second time");
        return this.promise;
      }).then(null, function (data) {
        expect(data).toEqual("test was rejected the second time");
        done();
      })
    });

    it("should delay resolution on many steps", function(done) {
      var handler = function (data) {
        setTimeout(this.handle(function() {
          this.resolve(data + ".");
        }));
        return this.promise;
      }
      ctrl.promise.then(handler).then(handler).then(handler).then(handler).then(function (data) {
        expect(data).toEqual("resolved.....");
        done();
      });
      ctrl.resolve("resolved.");
    });

    it("should propagate a reject through many steps", function (done) {
      var spy = jasmine.createSpy("Chain spy");
      ctrl.promise.then(null, spy).then(null, spy).then(null, spy).then(null, spy).then(null, function (reason) {
        expect(reason).toEqual("for a good reason");
        expect(spy.callCount).toEqual(4);
        done();
      });
      ctrl.reject("for a good reason");
    });
  });


  describe("ctrl#handle", function () {
    it("should return a handle", function (done) {
      var handle = ctrl.handle(function (arg) {
        this.resolve("deferred " + arg);
      });
      ctrl.promise.then(function (data) {
        expect(data).toEqual("deferred 123");
        done();
      });
      handle(123);
    });

    it("should return a promise of the deferred function", function () {
      ctrl.handle(function () {
        return "test";
      })().then(function  (data) {
        expect(data).toEqual("test");
      });
    });

    it("should catch an error and reject promise with it", function (done) {
      var handle = ctrl.handle(function () {
        throw "later error";
      });
      ctrl.promise.then(null, function (err) {
        expect(err).toEqual("later error");
        done();
      });
      handle();
    });
  });

  describe("callAsync", function () {
    var spy;
    beforeEach(function () {
      spy = jasmine.createSpy();
      spy.andReturn("test");
    });

    it("should call a function returning a promise", function (done) {
      p.callAsync(spy)
        .then(function (data) {
          expect(data).toEqual("test");
          done();
        });
    });

    it("should pass args", function () {
      p.callAsync(spy, 1, 2, 3);
      expect(spy).wasCalledWith(1,2,3);
    });

    it("should allow the function to respond with a promise", function (done) {
      spy.andCallFake(function () {
        this.resolve("test");
        return this.promise;
      });
      p.callAsync(spy)
        .then(function (data) {
          expect(data).toEqual("test");
          done();
        });
    });

    it("should allow the function reject the promise and return nothing", function (done) {
      spy.andCallFake(function () {
        this.reject("it was rejected");
      });
      p.callAsync(spy)
        .then(null, function (data) {
          expect(data).toEqual("it was rejected");
          done();
        })
    });

    it("should catch an error and reject the promise", function (done) {
      spy.andCallFake(function () {
        throw "some error";
      });
      p.callAsync(spy)
      .then(null, function (data) {
        expect(data).toEqual("some error");
        done();
      });
    });
  });
});