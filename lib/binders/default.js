var path = require("path");
var fs = require("fs");
var scanner = require("../scanner");
var when = require("when");
var whennode = require('when/node');
var sequence = require('when/sequence');

/**
 * Configure the default binder definition
 *
 * @param  {Definition} def The default binder definition
 */
module.exports = function defineDefault(def) {
  def.name = "default";
  ///////////////
  // Condition
  ///////////////
  def.condition("always", function () { return true; });
  def.condition("fileExt", function (pth, cxt, ext) {
    return (cxt.file && typeof ext === "string" && ext === cxt.file.ext);
  });
  def.condition("file", function (pth, cxt) {
    return !!cxt.file;
  });
  def.condition("dir", function (pth, cxt) {
    return cxt.file && cxt.file.isDir;
  });
  def.condition("route", function (pth, cxt, route) {
    if (typeof route !== "string") {
      return false;
    }
    return route === cxt.route.join("/");
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
          return scanner.scan(path.join(pth, file), subCxt).then(function (data) {
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

  return def;
};