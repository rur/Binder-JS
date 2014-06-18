function Expression() {
  this.commands = [];
  this.command = {};
}

Expression.prototype.addWords = function (words) {
  for (var i = 0; i < words.length; i++) {
    // here I'm assuming that each word has already been validated
    this.command[words[i]] = _bindWord(this, words[i]);
  }
};

function _bindWord(expr, word) {
  return function () {
    expr.commands.push({
      name: word,
      args: Array.prototype.slice.call(arguments)
    });
    return expr.command;
  };
}


module.exports = Expression;