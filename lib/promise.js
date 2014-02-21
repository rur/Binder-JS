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
 * Chain another promise to occur after this one, creating a new promise;
 *
 * @param  {function} fnc A function that returns a promise, it will be called when this promise
 *                        is resolved successfully, but not if it is rejected.
 * @return {Promise} Promise that will be completed after both have resolved or
 *                   either one has rejected
 */
Promise.prototype.chain = function(fnc) {
  var ctrl = new PromiseCtrl("Chained Promise");
  this.then(function (data) {
    fnc(data).then(ctrl.resolve.bind(ctrl), ctrl.reject.bind(ctrl));
  }, function (data) {
    ctrl.reject(data);
  });
  return ctrl.promise;
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
  complete(this.promise, "resolve", data);
};

PromiseCtrl.prototype.reject = function(data) {
  complete(this.promise, "reject", data);
};

exports.PromiseCtrl = PromiseCtrl;

/**
 * Complete the promise
 *
 * @private
 * @param  {Promise}  promise    The promise to complete
 * @param  {string}   how        'resolve' or 'reject'
 * @param  {mixed}    with_data  The data to pass to the handler
 */
function complete (promise, how, with_data) {
  if (promise.isCompleted) throw "Cannot "+how+", promise has already been completed";
  // config
  promise.isResolved = (how === "resolve");
  promise.isRejected = (how === "reject");
  promise.isCompleted = true;
  // execute handlers
  var i, handler;
  while(!!(handler = promise._thens.pop())) {
    if (typeof handler[how] === "function") {
      handler[how](with_data);
    }
  }
  // override then function to call newly registered handlers immediately
  promise.then = function (resolve, reject) {
    resolve = typeof resolve === "function" ? resolve : noop;
    reject  = typeof reject === "function" ? reject : noop;
    if (how === "resolve") resolve(with_data);
    else reject(with_data);
  };
}

function noop () {
  "pass";
}