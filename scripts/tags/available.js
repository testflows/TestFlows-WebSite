/**
 * Use
 * {% available %}
 *
 */

'use strict';

var marked = require('marked');

hexo.extend.tag.register('available', function(args, body) {
  return '&#10024; Available in';
}, {ends: false});
