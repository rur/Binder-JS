var p = require("./promise");

/**
 * Wraps a parse rule which consists of a test function
 * and a parse function defined by the binder and executed
 * by the scanner.
 *
 * The test function is run on the context provided by
 * the scanner to determine if the parse function should be
 * applied. It does so by returning a boolean.
 *
 * The parse function receives data about the file and directs
 * how that files should be read into memory.
 *
 * @param {function} test  Test against context to see if this parse
 *                         function should be applied
 * @param {function} parse The function that does the file parsing
 */
function Parser (test, parse) {
  this.test = test;
  this._parse = parse;
}

/**
 * Run the parse function
 *
 * @return {Promise} returns A promise with a single #then method which
 *                           accepts a resolve/success and reject/error handler.
 */
Parser.prototype.parse = function(path) {
  var ctrl = new p.PromiseCtrl("Parser of '"+path+"'");
  var promise = ctrl.promise;
  var resp = this._parse.call(ctrl, path);

  if (resp !== promise && !promise.isRejected) {
    ctrl.resolve(resp);
  }
  return promise;
};

exports.Parser = Parser;
