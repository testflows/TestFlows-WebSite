/**
 * Images in blog pages load when they are about to be seen. The posts carry hundreds of images, some of them
 * animated GIFs of several megabytes, and a reader should not wait for the ones far down the page. The first
 * image of a page is left alone, as it may be on screen at once.
 */

"use strict";

hexo.extend.filter.register("after_render:html", function (str, data) {
  const path = String((data && (data.path || (data.page && data.page.path))) || "");
  if (!/^blog\//.test(path)) {
    return str;
  }
  let seen = 0;
  return str.replace(/<img\b[^>]*>/g, function (tag) {
    seen += 1;
    if (seen === 1 || /\sloading=/.test(tag)) {
      return tag;
    }
    return tag.replace(/<img\b/, '<img loading="lazy" decoding="async"');
  });
});
