/**
 * Use
 * {% testflows %}
 *
 */

'use strict';

hexo.extend.tag.register('testflows', function(args, body) {
  return '<span><img alt="TestFlows.com Open-Source Testing Framework" style="display: inline; vertical-align: bottom; height: 2em;" src="/img/logo.png"></span>';
}, {ends: false});
