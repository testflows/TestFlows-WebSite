/**
 * Use
 * {% attention %}
 *
 */

'use strict';

var marked = require('marked');

hexo.extend.tag.register('attention', function(args, body) {
  return '&#9995;';
}, {ends: false});
