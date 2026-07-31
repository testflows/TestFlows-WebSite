/*
 * Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL. This file contains trade secrets and
 * confidential information of Katteli Inc. Unauthorized copying, disclosure,
 * distribution, or use of this file, via any medium, is strictly prohibited
 * without express written authorization from Katteli Inc.
 *
 * Authors:
 * Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 *
 * Use
 * {% index_latest_post %}
 */

'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

hexo.extend.tag.register('index_latest_post', function () {
  var posts = hexo.locals.get('posts');
  if (!posts || !posts.length) {
    return '';
  }

  var latest = posts.sort('date', -1).data[0];
  if (!latest) {
    return '';
  }

  var root = hexo.config.root || '/';
  var path = root + String(latest.path || '').replace(/^\//, '');
  var title = escapeHtml(latest.title || '');
  var when = latest.date ? new Date(latest.date) : null;
  var dateLabel = when
    ? when.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';
  var dateXml = when ? when.toISOString() : '';
  var html = '<div class="row index-journal-feature">';

  if (latest.image) {
    html +=
      '<div class="col-md-5 index-journal-col">' +
      '<a class="index-journal-media" href="' +
      path +
      '">' +
      '<img src="' +
      root +
      latest.image +
      '" alt="' +
      title +
      '">' +
      '</a></div>';
  }

  html +=
    '<div class="col-md-7 index-journal-col">' +
    '<article class="index-journal-copy">' +
    '<h3><a href="' +
    path +
    '">' +
    title +
    '</a></h3>';

  if (latest.excerpt) {
    html +=
      '<div class="index-journal-excerpt">' +
      latest.excerpt +
      '<i class="post-summary-more">...</i></div>';
  }

  html += '<div class="index-journal-meta">';
  if (latest.author) {
    html +=
      '<span class="index-journal-author">' +
      escapeHtml(latest.author) +
      '</span>';
  }
  if (dateLabel) {
    html +=
      '<time datetime="' + dateXml + '">' + dateLabel + '</time>';
  }
  html += '</div></article></div></div>';

  return html;
});
