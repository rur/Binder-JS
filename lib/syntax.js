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
    throw new BinderSyntaxError("Unknown parser: '" + name + "'");
  }
};

Syntax.prototype.getCondition = function(name) {
  if (this.conditions.hasOwnProperty(name)) {
    return this.conditions[name];
  } else {
    throw new BinderSyntaxError("Unknown condition: '" + name + "'");
  }
};


function BinderSyntaxError(message) {
  this.name = "BinderSyntaxError";
  this.message = message;
  this.stack = (new Error()).stack;
}

BinderSyntaxError.prototype = new Error();

Syntax.Error = BinderSyntaxError;

module.exports = Syntax;