var cx = require("./context");
var s = require("./scanner");
var p = require("./parser");
var fs = require("fs");
var path = require("path");

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
    function (pth, cxt) {
      // create file property in context
      fs.stat(pth, this.handle(function (err, stats) {
        if (err) {
          this.reject(err);
        } else {
          cxt.file = {
            isDir: stats.isDirectory(),
            ext: path.extname(pth),
          };
          this.resolve();
        }
      }));
      return this.promise;
    },
    function (pth, cxt) {
      // check file size limit
    }
  ];
  return filters;
}

function defaultParsers () {
  var parsers = [
    /**
     * Null Parser
     */
    new p.Parser(function () {
      return true;
    }, function () {
      this.reject(); // skip
    }),
    /**
     * UTF File Parser
     */
    new p.Parser(function (_, cxt) {
      var fileTypes = [".txt", ".js"];
      return fileTypes.indexOf(cxt.file.ext) > -1;
    }, function (pth) {
      fs.readFile(pth, "utf-8", this.handle(function (err, data) {
        if (err) {
          this.reject(err);
          return;
        }
        this.resolve(data);
      }));
      return this.promise;
    }),
    /**
     * Folder Parser
     */
    new p.Parser(function (_, cxt) {
      return cxt.file.isDir;
    }, function (pth, cxt) {
      var parser = this;
      fs.readdir(pth, this.handle(function (err, files) {
        var count, fileData = {};
        var subCxt, file;
        // handlers
        function makeFileResolver(file, f_cxt) {
          return parser.handle(function (data) {
            fileData[file] = data;
            if (--count === 0) {
              this.resolve(fileData);
            }
          });
        }
        function makeFileRejector(file, f_cxt) {
          return parser.handle(function (err) {
            count--;
            if (err !== void 0) {
              this.reject(err);
            }
          });
        }
        //
        if (err) {
          this.reject(err);
        } else {
          count = files.length;
          for (var i=0, len=count; i < len; i++) {
            subCxt = cxt.dup();
            file = files[i];
            s.scanFile(path.join(pth, file), subCxt).then(
              makeFileResolver(file, subCxt),
              makeFileRejector(file, subCxt)
            );
          }
        }
      }));
      return this.promise;
    })
  ];
  return parsers;
}