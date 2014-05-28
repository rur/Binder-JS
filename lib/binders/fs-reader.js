var path = require("path");
var fs = require("fs");
var scanner = require("../scanner");
var when = require("when");
var whennode = require('when/node');
var sequence = require('when/sequence');

var def = require('../register')("fs-reader");

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

//-----------
// Init
//-----------
def.init(function (binder) {
  /**
   * Get File data Filter
   *
   * @param  {string} pth The file path
   * @param  {Context} cxt The current binder context
   */
  binder.filter(function (pth, cxt) {
    if (typeof pth !== "string") return;
    return whennode.call(fs.stat, pth).then(function (stats) {
      cxt.file = {
          isDir: stats.isDirectory(),
          ext: path.extname(pth),
          name: path.basename(pth),
          path: path.resolve(pth)
        };
    })
    .catch(function predicate(er) {
      return er.code === "ENOENT";
    }, function handler(err) {
      // cxt.file = {};
    });
  });

  binder.filter(function (pth, cxt) {
    if (!cxt.route) {
      // assume this is the root
      cxt.route = [];
    } else if (cxt.file && cxt.file.isDir) {
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