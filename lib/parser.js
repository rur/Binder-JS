/**
 * Wraps a parse rule which consists of a test function
 * and a parse function defined by the binder and executed
 * by the scanner.
 *
 * The test function is run on the context provided by
 * the scanner to deturmine if the parse function should be
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
 * @return {Promise} returns A promise with a single
 *                           then method which accepts a success and
 *                           error handler.
 */
Parser.prototype.parse = function() {
  var promise = new Promise();
  var api = {
    promise: promise,
    resolve: resolve(promise),
    error: reject(promise)
  };
  var resp = this._parse.call(api);

  if (resp !== promise && !promise.isRejected) {
    api.resolve(resp);
  }
  return promise;
};

exports.Parser = Parser;


///////////
// Private
///////////

/**
 * Bare bones promise implementation
 */
function Promise () {
  this._thens = [];
}

/**
 * Add a handlers to this promise
 *
 * @param  {function} onResolve will be called with the data once the promise is resolved
 * @param  {function} onReject  Will be called instead of resolve if there was an error
 */
Promise.prototype.then = function (onResolve, onReject) {
  this._thens.push({ resolve: onResolve, reject: onReject });
};


function resolve (promise) {
  return function (data) {
    if (promise.isCompleted) throw "Cannot resolve, promise has already been completed";
    complete("resolve", promise._thens, data);
    promise.isResolved = true;
    promise.isCompleted = true;
    promise.then = function (resolve) {
      resolve(data);
    };
  };
}

function reject (promise) {
  return function (data) {
    if (promise.isCompleted) throw "Cannot reject, promise has already been completed";
    complete("reject", promise._thens, data);
    promise.isRejected = true;
    promise.isCompleted = true;
    promise.then = function (_, reject) {
      reject(data);
    };
  };
}

function complete (how, handlers, data) {
  var i, handler;
  while(!!(handler = handlers.pop())) {
    if (typeof handler[how] === "function") {
      handler[how](data);
    }
  }
}