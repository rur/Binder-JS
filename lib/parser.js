

function Parser (test, parse) {
  this.test = test;
  this._parse = parse;
}

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


/**
 * Bare bones promise implementation
 */
function Promise () {
  this._thens = [];
}

/**
 * Add a handlers to this promise
 * @param  {function} onResolve will be called with the data once the promise is resolved
 * @param  {function} onReject  Will be called instead of resolve if there was an error
 */
Promise.prototype.then = function (onResolve, onReject) {
  this._thens.push({ resolve: onResolve, reject: onReject });
};


function resolve (promise) {
  return function (data) {
    if (promise.isResolved || promise.isRejected) throw "Cannot resolve, promise has already been completed";
    complete("resolve", promise._thens, data);
    promise.isResolved = true;
    promise.then = function (resolve) {
      resolve(data);
    };
  };
}

function reject (promise) {
  return function (data) {
    if (promise.isResolved || promise.isRejected) throw "Cannot reject, promise has already been completed";
    complete("reject", promise._thens, data);
    promise.isRejected = true;
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