var Expression = require('./expression');
var Parser = require('./parser');

function Syntax () {
  this.parsers = {};
  this.conditions = {};
}

Syntax.prototype.commandInterface = function() {
  var statements = [];
  var syntax = this;

  return {
    statements: statements,
    beginStatement: function () {
      var expr = new Expression();
      expr.addWords(Object.keys(syntax.parsers));
      expr.addWords(Object.keys(syntax.conditions));
      statements.push(expr.commands);
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