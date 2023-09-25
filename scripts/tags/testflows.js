/**
 * Use
 * {% testflows %}
 *
 */

'use strict';

hexo.extend.tag.register('testflows', function(args, body) {
  return '<span><img style="display: inline; vertical-align: bottom; height: 2em;" src="/img/logo.svg"></span>';
}, {ends: false});
