
/**
 * Module dependencies.
 */

var debug = require('debug')('css-nesting:lexer');

/**
 * Pesudo selectors.
 */

var pseudos = [
  ':selection',
  'fullscreen',
  'nth-child',
  'first-child',
  'last-child',
  'link',
  'visited',
  'hover',
  'active',
  'focus',
  'first-letter',
  'first-line',
  'before',
  'after',
  'lang',
  'enabled',
  'disabled',
  'only-child',
  'only-of-type',
  'first-of-type',
  'last-of-type',
  'nth-last-of-type',
  'nth-of-type',
  'root',
  'empty',
  'target',
  'not',
  '-o',
  '-ms',
  '-moz',
  '-webkit'
]

/**
 * Property regexp.
 */

pseudos = pseudos.join('|');
var propre = new RegExp('^ *([-\\w]+):(?!' + pseudos + ') *([^\n]*)');

/**
 * Scan the given `str` returning tokens.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

module.exports = function(str) {
  var indents = [0]
    , stash = [];

  return scan();

  /**
   * tok+
   */

  function scan() {
    var toks = []
      , curr;

    while (str.length) {
      curr = next();
      curr && toks.push(curr);
      
      debug("", curr);

      if (str.length && !curr) {
        throw new Error('syntax error near "' + str.slice(0, 10) + '"');
      }
    }

    debug(stash);

    toks = toks.concat(stash);
    while (indents.pop()) toks.push(['outdent']);
    toks.push(['eos']);
    return toks;
  }

  /**
   *   eos
   * | whitespace
   * | rule
   */

  function next() {
    return stashed()
      || whitespace()
      || comments()
      || parent()
      || prop()
      || rule()
      || open()
      || close();
  }

  /**
   * Deferred tokens.
   */

  function stashed() {
    return stash.shift();
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(str);
    if (!m) return;
    str = str.slice(m[0].length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments() {
    while (comment()) ;
  }

  /**
   * Parse comment.
   */

  function comment() {
    if ('/' == str[0] && '*' == str[1]) {
      var i = 2;
      while ('*' != str[i] || '/' != str[i + 1]) ++i;
      i += 2;
      str = str.slice(i);
      whitespace();
      return true;
    }
  }

  /**
   * Parent reference.
   */

  function parent() {
    var m = str.match(/^ *&([^\n]*)/);
    if (!m) return;
    str = str.slice(m[0].length);
    var ret = ['rule', [m[1]]];
    ret.parent = true;
    return ret;
  }

  /**
   * Property.
   */

  function prop() {
    // prop
    var prop = match(/^(\*?[-\w]+)\s*/);
    if (!prop) return;
    prop = prop[0];

    // :
    if (!match(/^:\s*/)) return;

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)\s*/);
    if (!val) return;
    val = val[0].trim();

    // ;
    match(/^[;\s]*/);

    return ['prop', prop, val];
  }

  /**
   * Rule.
   */

  function rule() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    return ['rule', m[0].trim().split(/\s*,\s*/)];
  }

  /**
   * Open brace
   */
  function open() {
    var m = match(/^{\s*/);
    if(!m) return;
    return ['indent'];
  };

  /**
   * Close brace
   */
  function close() {
    var m = match(/^}\s*/);
    if(!m) return;
    return ['outdent'];
  };
}