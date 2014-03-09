/**
 * Wraps a parse rule which consists of a condition function
 * and a parse function defined by the binder and executed
 * by the scanner.
 *
 * The condition function is run on the context provided by
 * the scanner to determine if the parse function should be
 * applied. It does so by returning a boolean.
 *
 * The parse function receives data about the file and directs
 * how that files should be read into memory.
 *
 * @param {function} condition  Boolean function used to test context to see if
 *                              this parse function should be applied
 * @param {function} parse The function that does the file parsing
 */
function Parser (condition, parser) {
  this.condition = condition;
  this.parse = parser;
}

module.exports = Parser;
