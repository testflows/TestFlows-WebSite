/**
 * Use
 * {% attention %}
 *
 */

'use strict';

hexo.extend.tag.register('attention', function(args, body) {
  return '&#9995;';
}, {ends: false});
