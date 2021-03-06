var proc = require('../lib/proc');

describe("proc", function () {
  function example () {}

  it("should be a function", function () {
    expect(proc).toEqual(jasmine.any(Function));
  });

  describe("constructor", function () {
    it("should create an array like object", function () {
      expect(proc(example)[0]).toBe(example);
    });

    it("should add a passed in function to its list", function () {
      var p = proc(example);
      expect(p[0]).toBe(example);
    });

    it("should add an array of functions", function () {
      var p = proc([example, example]);
      expect(p.length).toEqual(2);
    });

    it("should add a series of functions", function () {
      var p = proc(example, example);
      expect(p.length).toEqual(2);
    });

    it("should duplicate a proc passed in", function () {
      var p = proc(example);
      var p2 = proc(p);
      expect(p2[0]).toBe(example);
    });

    it("should pass a proc back", function () {
      var p = proc(example);
      expect(proc(p)).toBe(p);
    });
  });

  describe("#add", function () {
    var p;
    beforeEach(function () {
      p = proc(example);
      p.add(example);
    });

    it("should add a couple of functions", function () {
      expect(p[1]).toBe(example);
    });

    it("should increment the length", function () {
      expect(p.length).toEqual(2);
    });

    it("should add a proc", function () {
      p.add(proc(example));
      expect(p.length).toEqual(3);
    });
  });

  describe("#addBefore", function () {
    var p;
    function example2() {}

    beforeEach(function () {
      p = proc(example)
      p.addBefore(example2);
    });

    it("should add a functions before", function () {
      expect(p[0]).toBe(example2);
    });

    it("should keep the existing", function () {
      expect(p[1]).toBe(example);
    });

    it("should have the correct length", function () {
      expect(p.length).toEqual(2);
    });
  });

  describe("#toArray", function () {
    var arr;
    beforeEach(function () {
      arr = proc(example).toArray();
    });

    it("should create an array", function () {
      expect(arr).toEqual([example]);
    });
  });

  describe("#liftSeries", function () {
    var p, spy, curried;
    beforeEach(function () {
      spy = jasmine.createSpy('curried method');
      p = proc(spy, spy);
      p.defaultParams = [1, 2, 3];
      curried = p.liftSeries();
    });

    it("should return an array", function () {
      expect(curried).toEqual(jasmine.any(Array));
    });

    it("should have the same length as the proc", function () {
      expect(curried.length).toEqual(p.length);
    });

    it("should call with default args", function () {
      curried[1]("a", "b");
      expect(spy).wasCalledWith("a", "b", 3);
    });

    it("should work with no default args", function () {
      p.defaultParams = [];
      p.liftSeries()[0]("a");
      expect(spy).wasCalledWith("a");
    });

    it("should combine arguments with default params when currying", function () {
      p.liftSeries(undefined, "hello")[0](true);
      expect(spy).wasCalledWith(true, "hello", 3);
    });
  });

  describe("#liftPredicate", function () {
    var p, spy, pred;
    beforeEach(function () {
      spy = jasmine.createSpy("curried predicate");
      spy.andReturn(true);
      p = proc(spy, spy);
      p.defaultParams = [1,2,3];
      pred = p.liftPredicate();
    });

    it("should return true", function () {
      expect(pred()).toBe(true);
    });

    it("should curry the functions", function () {
      pred("a");
      expect(spy).wasCalledWith("a", 2, 3);
    });

    it("should return false if a function returns false", function () {
      p.add(function () {
        return false;
      });
      pred = p.liftPredicate();
      expect(pred()).toBe(false);
    });

    it("should combine arguments with defaultParams when currying", function () {
      pred = p.liftPredicate(undefined, "hello");
      pred("abc");
      expect(spy).wasCalledWith("abc", "hello", 3);
    });

    it("should work with a spy", function () {
      var spy = jasmine.createSpy();
      var p = proc(spy);
      p.defaultParams[3] = "hello";
      pred = p.liftPredicate(1,2,3);
      pred("a");
      expect(spy).wasCalledWith("a", 2, 3, 'hello');
    });
  });
});