var path = require("path");
var fs = require("fs");
var whennode = require('when/node');
/**
 * Configure the reader binder definition
 *
 * @param  {Definition} def The reader binder definition
 */
module.exports = function defineReader(def) {

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

  return def;
};