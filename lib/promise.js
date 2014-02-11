/**
 * Bare bones promise implementation
 *
 * @private
 * @constructor
 * @param {string} name The name of this promise instance
 */
function Promise (name) {
  this.name = name;
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

/**
 * This is used by the creator of the promise
 * to resolve or reject it.
 *
 * @constructor
 * @param {string} name The name to assign to the promise
 */
function PromiseCtrl (name) {
  this.promise = new Promise(name);
}

PromiseCtrl.prototype.resolve = function(data) {
  complete("resolve", this.promise, data);
};

PromiseCtrl.prototype.reject = function(data) {
  complete("reject", this.promise, data);
};

exports.PromiseCtrl = PromiseCtrl;

/**
 * Complete the promise
 *
 * @private
 * @param  {string}   how     'resolve' or 'reject'
 * @param  {Promise}  promise The promise to complete
 * @param  {mixed}    data    The data to pass to the handler
 */
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
  // override then function to call newly registered handlers immediately
  promise.then = function (resolve, reject) {
    resolve = typeof resolve === "function" ? resolve : noop;
    reject  = typeof reject === "function" ? reject : noop;
    if (how === "resolve") resolve(data);
    else reject(data);
  };
}

function noop () {
  "pass";
}