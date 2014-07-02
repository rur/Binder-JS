var Expression = require('./expression');
var Parser = require('./parser');

function Syntax () {
  this.parsers = {};
  this.conditions = {};
}

Syntax.prototype.getParser = function(name) {
  if (this.parsers.hasOwnProperty(name)) {
    return this.parsers[name];
  } else {
    throw new Error("unknown parser: '" + name + "'");
  }
};

Syntax.prototype.getCondition = function(name) {
  if (this.conditions.hasOwnProperty(name)) {
    return this.conditions[name];
  } else {
    throw new Error("unknown condition: '" + name + "'");
  }
};

module.exports = Syntax;