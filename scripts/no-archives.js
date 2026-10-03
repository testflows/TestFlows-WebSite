/**
 * No archive pages. hexo-generator-archive writes /archives/, one page for each year and one for each month,
 * and this theme has no archive layout, so every one of them was an empty page titled "TestFlows | TestFlows".
 * Nothing links to them and the sitemap does not list them. The blog page lists every post.
 * Registering the generator again under its own name replaces the plugin's with one that writes nothing.
 */

"use strict";

hexo.extend.generator.register("archive", function () {
  return [];
});
