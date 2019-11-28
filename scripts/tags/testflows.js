/**
 * Use
 * {% testflows %}
 *
 */

'use strict';

var marked = require('marked');

hexo.extend.tag.register('testflows', function(args, body) {
  return '<span style="font-weight: 600">Test</span><span style="color: #5cccfc; font-weight: 600;">Flows</span>'
}, {ends: false});
