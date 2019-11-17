/**
 * Sean Gravener - @seangravener
 * https://github.com/seangravener/hexo-tag-htmlTag
 *
 * Use
 * {% htmlTag span class="highlight text" %}
 *   Something important
 * {% endhtmlTag %}
 *
 * Multiple Attributes
 * {% htmlTag button type="button" data-submit data-action="add" %}
 *   Add 10
 * {% endhtmlTag %}
 */

'use strict';

var marked = require('marked');

function isKeyValuePair(attr) {
  return !!(attr.indexOf('=') >= 0);
};

function argsToAttrs(attrs) {
  var attrString = '{key}="{values}"';

  attrs.forEach(function(attr, index){
    if (isKeyValuePair(attr)) {
      var pair = attr.split('=');

      attrs[index] = attrString
        .replace(/{key}/g, pair[0])
        .replace(/{values}/g, pair[1]);
    };
  });

  return attrs.join(' ');
};

hexo.extend.tag.register('html', function(args, body) {
  var tagName = args[0],
      body = marked(body),
      tag = '<{tagName} {attrs}>{body}</{tagName}>',
      attrs = '';

  args.shift();
  attrs = argsToAttrs(args);

  return tag
    .replace(/{tagName}/g, tagName)
    .replace(/{attrs}/g, attrs)
    .replace(/{body}/g, body);
}, {ends: true});
