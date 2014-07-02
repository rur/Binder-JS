/**
 * Creates an expression object which records the access to its properties
 * as a commands, and the invocation of those properties as command arguments
 *
 * It can be used to create DSL style APIs
 *
 * eg.
 *     expr.addWords(["a", "b", "c"]);
 *     expr.command.a.b.c(1, 2, 3);
 *     expr.commands.should.equal([
 *       {name: "a", args: []},
 *       {name: "b", args: []},
 *       {name: "c", args: [1,2,3]}
 *     ]);
 *
 * nb. it only knows what words are valid, it does not enforce any grammar
 *
 * @private
 */
function Expression() {
  this.commands = [];
  this.command = function () {
    var args = [].slice.call(arguments);
    if (this.commands.length) {
      this.commands[this.commands.length - 1].args = args;
    }
    return this.command;
  }.bind(this);
}

/**
 * add a list of words that can be call in this expression
 *
 * @throws {Error} If any of the words cannot be used in an expression
 * @param {Array<String>} words A list of words
 */
Expression.prototype.addWords = function (words) {
  for (var i = 0; i < words.length; i++) {
    try {
      // TODO: Validate the world is the correct characters for an identifier
      Object.defineProperty(this.command, words[i], {
        get: _bindGetter(this, words[i]),
        enumerable: true
      });
    } catch (er) {
      throw new Error("BinderJS Expression: Unable to define the word: '" + words[i] + "'");
    }
  }
};

// ----------
// Export
// ----------
exports.create = function createExpr(syntax) {
  var expr = new Expression();
  expr.addWords(Object.keys(syntax.parsers));
  expr.addWords(Object.keys(syntax.conditions));
  return expr;
};

// ----------
// Private
// ----------
/**
 * Create a getter which registers a command and
 * allows arguments to get registered after
 *
 * @param  {Expression} expr  The expression for the current statement
 * @param  {String}     word  The property name (word) that this getter is associated with
 * @return {Function}         The expr.command property
 */
function _bindGetter(expr, word) {
  return function () {
    var command = {
      name: word,
      args: []
    };

    expr.commands.push(command);

    return expr.command;
  };
}