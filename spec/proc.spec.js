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

  describe("#currySeries", function () {
    var p, spy, curried;
    beforeEach(function () {
      spy = jasmine.createSpy('curried method');
      p = proc(spy, spy);
      p.defaultArgs = [1, 2, 3];
      curried = p.currySeries();
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
      p.defaultArgs = null;
      p.currySeries()[0]("a");
      expect(spy).wasCalledWith("a");
    });
  });
});