function proc() {
  var pc = new Procedure();
  pc.add.apply(pc, _array(arguments));
  return pc;
}

function Procedure() {
  this.length = 0;
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

  for (var i = 0; i < fns.length; i++) {
    p[this.length + i] = fns[i];
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


// ----------
// Private
// ----------

/**
 * Handle arguments pased into proc(fn|...) call and return
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