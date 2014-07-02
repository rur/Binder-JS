var Expression = require('./expression');
var Parser = require('./parser');

function Syntax () {
  this.parsers = {};
  this.conditions = {};
}

module.exports = Syntax;