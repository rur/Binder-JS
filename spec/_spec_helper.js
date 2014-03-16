exports.getFailSpy = function (test, done, name) {
  return function () {
    test.fail("'" + name + "' handler should not have been called. Args: [" + Array.prototype.slice.call(arguments).join(",") + "]");
    if (typeof done === "function") done();
  };
};