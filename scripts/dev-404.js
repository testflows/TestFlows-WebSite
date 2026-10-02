/**
 * `hexo server` only: answer unknown URLs with the site's 404 page and a real 404
 * status, as GitHub Pages does in production. Registered last, so it only sees
 * requests that no other server middleware (routes, static files) handled.
 */

"use strict";

hexo.extend.filter.register("server_middleware", function (app) {
  app.use(function (req, res, next) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    const stream = hexo.route.get("404.html");
    if (!stream) {
      next();
      return;
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (req.method === "HEAD") {
      stream.destroy();
      res.end();
      return;
    }
    stream.pipe(res);
  });
});
