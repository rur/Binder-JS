var Context = require("./context");
var s = require("./scanner");
var Rule = require("./rule");
var fs = require("fs");
var path = require("path");

function Binder () {
  Rule.call(this, new Context());
  //
  init(this);
}

Binder.prototype.compile = function(path) {
  return s.scanFile(path, this.context.dup(), this.compileTimeout);
};

////////////
// Exports
////////////
module.exports = Binder;

/////////////////////
// Filters & Parsers
/////////////////////
///
function init (binder) {
  // create file property in context
  binder.filter(function (pth, cxt) {
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
  });
  // Null Parser
  binder.parse(function () {
      return true;
    }, function () {
      this.reject(); // skip
    });
  // UTF Parser
  binder.parse(function (_, cxt) {
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
    });
  // Folder Parser
  binder.parse(function (_, cxt) {
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
    });
}