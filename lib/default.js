var path = require("path");
var fs = require("fs");
var scanner = require("./scanner");

/**
 * Configure the default binder definition
 *
 * @param  {Definition} def The default binder definition
 */
module.exports = function d_fault (def) {
  def.name = "default";
  ///////////////
  // Condition
  ///////////////
  def.condition("always", function () { return true; });
  def.condition("fileExt", function (pth, cxt, args) {
    return (typeof args[0] === "string" && args[0] === cxt.file.ext);
  });
  def.condition("dir", function (pth, cxt, args) {
    return cxt.file.isDir;
  });
  def.condition("route", function (pth, cxt, args) {
    if (typeof args[0] !== "string") {
      return false;
    }
    return args[0] === cxt.route.join("/");
  });


  /////////////////////
  // Parse Handlers
  /////////////////////
  def.parser("ignore", function () {
    this.reject();
    return this.promise;
  });

  def.parser("readUTF", function (pth) {
    fs.readFile(pth, "utf-8", this.handle(function (err, data) {
      if (err) {
        this.reject(err);
        return;
      }
      this.resolve(data);
    }));
    return this.promise;
  });

  def.parser("collectData", function(pth, cxt) {
    var parser = this;
    fs.readdir(pth, function(err, files) {
      if (err) {
        parser.reject(err);
        return;
      } else if (files.length === 0) {
        parser.resolve({});
        return;
      }
      var count = files.length,
          fileData = {},
          subCxt, file;
      // handlers
      function handleFileData (fileName, cxt) {
        return function (data) {
          fileData[fileName] = data;
          if (--count === 0) {
            parser.resolve(fileData);
          }
        };
      }
      function handleRejectFile (fileName, cxt) {
        return function(reason) {
          count--;
          if (reason !== void 0) {
            parser.reject(reason);
          }
        };
      }
      // file loop
      for (var i = 0, len = count; i < len; i++) {
        file = files[i];
        subCxt = cxt.dup();
        scanner.scanFile(path.join(pth, file), subCxt).then(
          handleFileData(file, subCxt),
          handleRejectFile(file, subCxt)
        );
      }
    });
    return this.promise;
  });

  /////////////////////
  // Initialize Binder
  /////////////////////
  def.init(function (binder) {
    /**
     * Get File data Filter
     *
     * @param  {string} pth The file path
     * @param  {Context} cxt The current binder context
     */
    binder.filter(function (pth, cxt) {
      fs.stat(pth, this.handle(function (err, stats) {
        if (err) {
          this.reject(err);
        } else {
          cxt.file = {
            isDir: stats.isDirectory(),
            ext: path.extname(pth),
            name: path.basename(pth),
            path: path.resolve(pth)
          };
          this.resolve();
        }
      }));
      return this.promise;
    });

    binder.filter(function (pth, cxt) {
      if (!cxt.route) {
        // assume this is the root
        cxt.route = [];
      } else if (cxt.file.isDir) {
        cxt.route = cxt.route.concat(cxt.file.name);
      }
    });

    /**
     * Null Parser
     */
    binder.parse.always().ignore();
    /**
     * .txt file Parser
     */
    binder.parse.fileExt(".txt").readUTF();
    /**
     * Folder Parser
     */
    binder.parse.dir().collectData();
  });

  return def;
};