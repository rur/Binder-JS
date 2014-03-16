var path = require("path");
var fs = require("fs");

/**
 * Configure the default binder definition
 *
 * @param  {Definition} def The default binder definition
 */
module.exports = function d_fault (def) {
  ///////////////
  // Condition
  ///////////////
  def.condition("always", function () { return true; });
  def.condition("fileExt", function (pth, cxt, args) {
    return (typeof args[0] === "string" && args[0] === cxt.file.ext);
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

  /////////////////////
  // Initialize Binder
  /////////////////////
  def.init(function (binder) {
    /**
     * Get File data filter
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
          };
          this.resolve();
        }
      }));
      return this.promise;
    });

    /**
     * Null Parser
     */
    binder.parse.always().ignore();
    /**
     * Txt file parser
     */
    binder.parse.fileExt(".txt").readUTF();
  });
};