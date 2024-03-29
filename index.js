
/**
 * Module dependencies.
 */

var parse = require('./lib/parser')
  , compile = require('./lib/compiler');

/**
 * Compile a nesting
 * `str` of CSS to the valid CSS
 * equivalent.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports = function(str){
  return compile(parse(str));
};