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
 * @return {Promise} returns A promise with a single #then method which
 *                           accepts a resolve/success and reject/error handler.
 */
Parser.prototype.parse = function(path) {
  var promise = new Promise();
  var api = {
    promise: promise,
    resolve: resolve(promise),
    reject: reject(promise)
  };
  var resp = this._parse.call(api, path);

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
    complete("resolve", promise, data);
  };
}

function reject (promise) {
  return function (data) {
    complete("reject", promise, data);
  };
}

function complete (how, promise, data) {
  if (promise.isCompleted) throw "Cannot "+how+", promise has already been completed";
  // config
  promise.isResolved = (how === "resolve");
  promise.isRejected = (how === "reject");
  promise.isCompleted = true;
  // execute handlers
  var i, handler;
  while(!!(handler = promise._thens.pop())) {
    if (typeof handler[how] === "function") {
      handler[how](data);
    }
  }
  // override then function to call newly registered handlers immideately
  promise.then = function (resolve, reject) {
    if (how === "resolve") resolve(data);
    else reject(data);
  };
}