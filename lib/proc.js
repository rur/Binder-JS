function proc(p) {
  if (arguments.length === 1 && p instanceof Procedure) {
    return p;
  }
  var pc = new Procedure();
  pc.add.apply(pc, _array(arguments));
  return pc;
}


/**
 * Procedure is a wrapper for zero or more functions
 * which constitute a single task. It adds an abstraction which
 * allows set of constituent primitive function to be composed
 * in more transparent way than using some functional techniques
 * such as those that involve creating closures to combine functions
 * together or transform arguments.
 *
 * @constructor
 * @private
 */
function Procedure() {
  this.length = 0;
  this.defaultParams = [];
}

/**
 * add a function to the procedure
 *
 * @param {Function|Array<Function>|Procedure} funcs A function, list of functions
 *                                                   or procedure to add
 */
Procedure.prototype.add = function () {
  var p = this;
  var fns = _parseArgs(_array(arguments));
  var d = this.length;
  for (var i = 0; i < fns.length; i++) {
    p[d + i] = fns[i];
    this.length++;
  }
};

/**
 * add a function to the start of the procedure
 *
 * @param {Function|Array<Function>|Procedure} funcs A function, list of functions
 *                                                   or procedure to add
 */
Procedure.prototype.addBefore = function () {
  var p = this;
  var fns = _parseArgs(_array(arguments)).concat(_array(this));
  this.length = 0;
  for (var i = 0; i < fns.length; i++) {
    p[i] = fns[i];
    this.length++;
  }
};

/**
 * Extract the functions in this procedure object
 * as a vanilla array
 *
 * @return {Array<Function>}
 */
Procedure.prototype.toArray = function () {
  return _array(this);
};

/**
 * create an array of functions curried with the defaultParams
 *
 * @return {Array<Function>} Fns in the same order they are in the proc instance
 */
Procedure.prototype.liftSeries = function () {
  var baseArgs = [],
      i, len = Math.max(arguments.length, this.defaultParams.length);

  for (i = 0; i < len; i++) {
    baseArgs[i] = arguments[i] === undefined ? this.defaultParams[i] : arguments[i];
  }
  var fns = this.toArray();
  return fns.map(_curryFn.bind(null, baseArgs));
};

/**
 * create a single predicate which returns true if all the
 * proc functions return true, these are called in sequence;
 *
 * @return {Function} Predicate function with baked in default params
 */
Procedure.prototype.liftPredicate = function () {
  var fns = this.liftSeries.apply(this, _array(arguments));
  return function () {
    var args =  _array(arguments);
    return fns.every(function (fn) {
      return !!fn.apply(null, args);
    });
  };
};


// ----------
// Private
// ----------

/**
 * Handle arguments passed into proc(fn|...) call and return
 * a list of functions to add to a new Procedure instance
 *
 * @private
 * @param  {mixed} arg Function, Array of functions or a proc (for dup)
 * @return {Array<Function>}     An array of functions
 */
function _parseArgs(args) {
  // the following will flatten arrays
  return Array.prototype.concat.apply([], args)
    .reduce(function (fns, fn){
      if (typeof fn === 'function') {
        fns.push(fn);
      } else if (fn instanceof Procedure) {
        fns.push.apply(fns, _array(fn));
      }
      return fns;
    }, []);
}

function _curryFn(args, fn) {
  return function () {
    var callArgs = [], i, len;
    for (i = 0, len = Math.max(args.length, arguments.length); i < len; i++) {
      callArgs[i] = arguments[i] === undefined ? args[i] : arguments[i];
    }
    return fn.apply(null, callArgs);
  };
}

/**
 * Convert an array-like object to an Array instance
 * with the same contents
 *
 * @private
 * @param  {mixed} a An array like object, or a primitive (typeof a != 'object')
 *                   that should be wrapped in an array
 * @return {Array}
 */
function _array(a) {
  if (typeof a !== 'object') {
    return [a];
  }
  return Array.prototype.slice.call(a);
}

// ---------
// Exports
// ---------

module.exports = proc;