var p = require("./parser");

function DefaultContext () {
  this.filters = defaultFilters();
  this.parsers = defaultParsers();
}

exports.DefaultContext = DefaultContext;

function defaultFilters () {
  var filters = [];

  return filters;
}

function defaultParsers () {
  var parsers = [];

  return parsers;
}