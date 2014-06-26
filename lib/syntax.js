var Expression = require('./expression');
var Parser = require('./parser');

function Syntax () {
  this.parsers = {};
  this.conditions = {};
}

Syntax.prototype.commandInterface = function() {
  var handlers = [];
  var syntax = this;
  function statementComplete(commands) {
    var i;
    for (i = 0; i < handlers.length; i++) {
      handlers[i](commands);
    }
  }

  return {
    onStatement: function (handler) {
      handlers.push(handler);
    },
    beginStatement: function () {
      var expr = new Expression();
      expr.addWords(Object.keys(syntax.parsers));
      expr.addWords(Object.keys(syntax.conditions));
      setTimeout(statementComplete.bind(null, expr.commands), 0);
      return expr.command;
    }
  };
};

Syntax.prototype.createParser = function (commands) {
  var p = new Parser();
  // populate the parser procedures from the commands
  return p;
};

module.exports = Syntax;