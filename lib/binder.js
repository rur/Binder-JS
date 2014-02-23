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
    new p.Parser(function (path, cxt) {
      return true;
    }, function (path) {
      this.reject(); // skip
    }),
    /**
     * UTF File Parser
     */
    new p.Parser(function (path, cxt) {
      var fileTypes = [".txt"];
      return fileTypes.indexOf(cxt.file.ext) > -1;
    }, function (path) {
      fs.readFile(path, "utf-8", this.handle(function (err, data) {
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
    }, function (folderPath, cxt) {
      var parser = this;
      fs.readdir(folderPath, this.handle(function (err, files) {
        var count, fileData = {};
        var subCxt, file;
        // handlers
        function makeFileResolver(file, f_cxt) {
          return parser.handle(function (data) {
            var name = file.replace(/\.\w+$/, "");
            fileData[name] = data;
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
            s.scanFile(path.join(folderPath, file), subCxt).then(
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