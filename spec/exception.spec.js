var e = require('../lib/exception');

describe("BinderException", function () {
  describe("constructor", function () {
    var excp;
    beforeEach(function () {
      excp = new e.BinderException('reason', 'subject', {mock: "Context"});
    });

    it("should have a reason property", function () {
      expect(excp.reason).toEqual('reason');
    });

    it("should have a subject property", function () {
      expect(excp.subject).toEqual('subject');
    });

    it("should have a context", function () {
      expect(excp.context.mock).toEqual('Context');
    });

    it("should have an empty parents array", function () {
      expect(excp.parents).toEqual([]);
    });
  });
});