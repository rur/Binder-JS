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

Expression.prototype.addWords = function (words) {
  for (var i = 0; i < words.length; i++) {
    try {
      Object.defineProperty(this.command, words[i], {
        get: _bindGetter(this, words[i]),
        enumerable: true
      });
    } catch (er) {
      throw new Error("BinderJS Expression: Unable to define the word: '" + words[i] + "'");
    }
  }
};

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


module.exports = Expression;