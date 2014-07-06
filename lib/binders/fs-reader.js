var path = require("path");
var fs = require("fs");
var when = require("when");
var whennode = require('when/node');
var sequence = require('when/sequence');
var bjs = require('../../index');

var Definition = require('../definition');


function createFSReaderDef() {

  var def = new Definition('fs-reader');

  /**
   * Configure the reader binder definition
   *
   * @param  {Definition} def The reader binder definition
   */

  //-----------
  // Conditions
  //-----------
  def.condition("fileExt", function (pth, cxt, ext) {
    return (cxt.file && typeof ext === "string" && ext === cxt.file.ext);
  });
  def.condition("file", function (pth, cxt) {
    return !!cxt.file;
  });
  def.condition("dir", function (pth, cxt) {
    return cxt.file && cxt.file.isDir;
  });

  //-----------
  // Parsers
  //-----------
  def.parser("readUTF", function (pth, cxt) {
    return whennode.call(fs.readFile, pth, "utf-8");
  });

  def.parser("collectData", function(pth, cxt) {
    return whennode.call(fs.readdir, pth).then(function (files) {
      if (files.length === 0) {
        return {};
      }

      var promise = sequence(files.map(function (file) {
        return function () {
          return bjs(cxt).compile(path.join(pth, file), file)
            .then(function (data) {
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

  //-----------
  // Init
  //-----------
  def.init(function (binder) {
    /**
     * The file scan limit is a limit on the accumulated size of the files
     * that this binder will look at. It's purpose is to prevent
     * the compile process from flying off the handle and scanning the whole file
     * system by accident.
     */
    binder.context.fileScanLimit = {
      max: (100/* MB */ * 1048576),
      soFar: 0
    };
    /**
     * Get File data Filter
     *
     * @param  {string} pth The file path
     * @param  {Context} cxt The current binder context
     */
    binder.filter(function fileInfoFilter(pth, cxt) {
      if (typeof pth !== "string") return;
      return whennode.call(fs.stat, pth).then(function (stats) {
        cxt.file = {
            isDir: stats.isDirectory(),
            ext: path.extname(pth),
            name: path.basename(pth),
            path: path.resolve(pth),
            size: stats.size
          };
      })
      .catch(function (er) {
        return er && er.code === "ENOENT";
      }, function (err) {
        // catch the error and do nothing
      });
    });

    binder.filter(function fileScanLimitFilter(pth, cxt) {
      if (cxt.file && cxt.fileScanLimit) {
        if (cxt.fileScanLimit.soFar + cxt.file.size > cxt.fileScanLimit.max) {
          return when.reject(new Error('File Scan limit reached'));
        }
        cxt.fileScanLimit.soFar += cxt.file.size;
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
}

// --------
// Exports
// --------

module.exports = createFSReaderDef;