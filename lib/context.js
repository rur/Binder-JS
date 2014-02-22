var p = require("./parser");
var dup_exclude = ["filters", "parsers"];

/**
 * The context is used to hold parsing state
 *
 * @constructor
 */
function Context () {
  this.filters = defaultFilters();
  this.parsers = defaultParsers();
}

/**
 * Create a deepish copy of itself
 *
 * @return {Context} A duplicate of this context
 */
Context.prototype.dup = function() {
  var dup = new Context();
  var cxt = this;
  dup.filters = cxt.filters.slice();
  dup.parsers = cxt.parsers.slice();
  Object.getOwnPropertyNames(cxt).forEach(function (name) {
    if (dup_exclude.indexOf(name) === -1) {
      dup[name] = cxt[name];
    }
  });
  return dup;
};

exports.Context = Context;

/////////////////////
// Filters & Parsers
/////////////////////

// TODO: Move this once api is worked out

function defaultFilters () {
  var filters = [
    function (path, cxt) {
      // test for missing file
    },
    function (path, cxt) {
      // get file info and assign to context
    },
    function (path, cxt) {
      // check file size limit
    }
  ];
  return filters;
}

function defaultParsers () {
  var parsers = [
    new p.Parser(function (path, cxt) {
      // test for folder
    }, function (path) {
      // folder parser
    }),
    new p.Parser(function (path, cxt) {
      // test for txt file
    }, function (path) {
      // utf parser
    })
  ];
  return parsers;
}