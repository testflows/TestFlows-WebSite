/*
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

/**
 * The post's excerpt. On a cold build (no db.json cache) pages render before posts do,
 * so `post.excerpt` is still empty; fall back to rendering the text before <!-- more -->.
 */
function excerptOf(post) {
  if (post.excerpt) {
    return post.excerpt;
  }
  var raw = String(post._content || post.raw || '');
  var cut = raw.indexOf('<!-- more -->');
  if (cut < 0) {
    return '';
  }
  try {
    return hexo.render.renderSync({ text: raw.slice(0, cut), engine: 'markdown' });
  } catch (e) {
    return '';
  }
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

  var excerpt = excerptOf(latest);
  if (excerpt) {
    html +=
      '<div class="index-journal-excerpt">' +
      excerpt +
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
