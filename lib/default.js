var path = require("path");
var fs = require("fs");
var scanner = require("./scanner");
var when = require("when");
var whennode = require('when/node');
var sequence = require('when/sequence');

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
    return when.reject();
  });

  def.parser("readUTF", function (pth) {
    return whennode.call(fs.readFile, pth, "utf-8");
  });

  def.parser("collectData", function(pth, cxt) {
    return whennode.call(fs.readdir, pth).then(function (files) {
      if (files.length === 0) {
        return {};
      }

      var promise = sequence(files.map(function (file) {
        return function () {
          var subCxt = cxt.dup();
          return scanner.scanFile(path.join(pth, file), subCxt).then(function (data) {
            return {name: file, data: data};
          }).catch(function (reason) {
            if (reason === void 0) {
              return when.resolve();
            }
            return when.reject(reason);
          });
        };
      }));

      return promise.then(function (files) {
        var outputData = {};
        files.forEach(function (file) {
          if (file !== void 0) {
            outputData[file.name] = file.data;
          }
        });
        return outputData;
      });
    });
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
      return whennode.call(fs.stat, pth).then(function (stats) {
        cxt.file = {
            isDir: stats.isDirectory(),
            ext: path.extname(pth),
            name: path.basename(pth),
            path: path.resolve(pth)
          };
      });
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