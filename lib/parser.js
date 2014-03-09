/**
 * Wraps a parse rule which consists of a test function
 * and a parse function defined by the binder and executed
 * by the scanner.
 *
 * The test function is run on the context provided by
 * the scanner to determine if the parse function should be
 * applied. It does so by returning a boolean.
 *
 * The parse function receives data about the file and directs
 * how that files should be read into memory.
 *
 * @param {function} test  Test against context to see if this parse
 *                         function should be applied
 * @param {function} parse The function that does the file parsing
 */
function Parser (test, parse) {
  this.test = test;
  this.parse = parse;
}

module.exports = Parser;
