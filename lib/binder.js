var cx = require("./context");
var s = require("./scanner");
var p = require("./parser");
var fs = require("fs");


function Binder () {
  // register default filters and parsers here
  this.context = new cx.Context();

  this.context.filters = defaultFilters();
  this.context.parsers = defaultParsers();
}

Binder.prototype.compile = function(path) {
  return s.scanFile(path, this.context.dup(), this.compileTimeout);
};

exports.Binder = Binder;



/////////////////////
// Filters & Parsers
/////////////////////

// TODO: Move this once api is worked out

function defaultFilters () {
  var filters = [
    function (path, cxt) {
      // get file info and assign to context
      fs.stat(path, this.handle(function (err, stats) {
        if (err) {
          this.reject(err);
        } else {
          cxt.isDir = stats.isDirectory();
          this.resolve();
        }
      }));
      return this.promise;
    },
    function (path, cxt) {
      // check file size limit
    }
  ];
  return filters;
}

function defaultParsers () {
  var parsers = [
    /**
     * UTF File Parser
     */
    new p.Parser(function (path, cxt) {
      return true;
    }, function (path) {
      var parser = this;
      fs.readFile(path, "utf-8", function (err, data) {
        if (err) {
          parser.reject(err);
          return;
        }
        parser.resolve(data);
      });
      return this.promise;
    }),
    /**
     * Folder Parser
     */
    new p.Parser(function (path, cxt) {
      return cxt.isDir;
    }, function (path) {
      var parser = this;
      parser.resolve("its a directory");
      return parser.promise;
    })
  ];
  return parsers;
}