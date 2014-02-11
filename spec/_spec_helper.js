exports.getFailSpy = function (test, msg, done) {
  return function () {
    test.fail(msg);
    if (typeof done === "function") done();
  };
};