exports.getFailSpy = function (test, done) {
  return function (data) {
    test.fail("Promise was rejected with msg: " + data);
    if (typeof done === "function") done();
  };
};