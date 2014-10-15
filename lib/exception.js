function BinderException(reason, subj, cxt) {
  this.reason = reason;
  this.subject = subj;
  this.context = cxt;
  this.parents = [];
}

/**
 * instance of predicate function
 *
 * @param  {inst} val Object to test
 * @return {Boolean}
 */
BinderException.instance = function (val) {
  return val instanceof BinderException;
};

exports.BinderException = BinderException;