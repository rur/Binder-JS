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
 * @returns {Promise} A chained promise
 */
Promise.prototype.then = function (onResolve, onReject) {
  var ctrl = new PromiseCtrl(this.name+" Then");
  onResolve = ctrl.handle(onResolve);
  this._thens.push({
    resolve: function(data) {
      onResolve(data);
    },
    reject: function(data) {
      if (typeof onReject === "function") onReject(data);
      ctrl.reject(data);
    }
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

/**
 * Create a handler for an async callback that can
 * be easily used to complete this promise. It will catch any
 * errors and pass them as reject.
 *
 * The function passed in will be called with the
 * Promise Controller as its 'this' object
 *
 * @param  {function} func The handler to call
 * @return {function} A function which wraps the one passed in
 */
PromiseCtrl.prototype.handle = function(func) {
  var ctrl = this;
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var returned;
    try {
      returned = func.apply(ctrl, args);
    } catch (er) {
      ctrl.reject(er);
      return ctrl.promise;
    }
    if (returned instanceof Promise) {
      return returned;
    } else if (!ctrl.promise.isCompleted) {
      ctrl.resolve(returned);
    }
    return ctrl.promise;
  };
};

PromiseCtrl.prototype.resolve = function(data) {
  complete(this.promise, "resolve", data);
};

PromiseCtrl.prototype.reject = function(data) {
  complete(this.promise, "reject", data);
};

/**
 * call a function that can choose to return synchronously
 * or through a promise.
 *
 * @param  {function} fnc     the function to call
 * @param  {mixed}    args... Variadic arguments to pass on to the function
 * @return {Promise}  A promise which is either completed syncronously through the return value
 *                      of the function or delayed until later
 */
function callAsync(fnc) {
  var ctrl = new PromiseCtrl("Call Async: '" + (fnc.name || 'anonymous') + "'");
  var args = Array.prototype.slice.call(arguments, 1);
  return ctrl.handle(fnc).apply(null, args);
}


///////////////////
// Exports
///////////////////

exports.PromiseCtrl = PromiseCtrl;
exports.callAsync = callAsync;

///////////////////
// Private
///////////////////

/**
 * Complete the promise
 *
 * @private
 * @param  {Promise}  promise    The promise to complete
 * @param  {string}   how        'resolve' or 'reject'
 * @param  {mixed}    with_data  The data to pass to the handler
 * @returns {boolean} False if the promise was already completed
 */
function complete (promise, how, with_data) {
  if (promise.isCompleted) return false;
  // config
  promise.isResolved = (how === "resolve");
  promise.isRejected = (how === "reject");
  promise.isCompleted = true;
  // execute handlers
  var i, handler;
  while(!!(handler = promise._thens.pop())) {
    if (typeof handler[how] === "function") {
      // TODO: wrap in try catch
      handler[how](with_data);
    }
  }
  // override thens push method to call newly registered handlers immediately
  promise._thens.push = function (handlers) {
    resolve = typeof handlers.resolve === "function" ? handlers.resolve : noop;
    reject  = typeof handlers.reject === "function" ? handlers.reject : noop;
    if (how === "resolve") resolve(with_data);
    else reject(with_data);
  };
  return true;
}

function noop () {
  "pass";
}