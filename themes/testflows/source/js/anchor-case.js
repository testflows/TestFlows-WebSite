// Copyright (C) 2026 Katteli Inc. All rights reserved.
//
// Heading ids are lower case. A link made before they were, #Using-Sketches, names
// an id that no longer exists, and the browser stays at the top of the page. When
// the fragment matches no id, scroll to the one that matches it ignoring case.
(function () {
  function findIgnoringCase(fragment) {
    var want = fragment.toLowerCase();
    var all = document.querySelectorAll('[id]');
    for (var i = 0; i < all.length; i++) {
      if (all[i].id.toLowerCase() === want) return all[i];
    }
    return null;
  }

  function follow() {
    var fragment;
    try {
      fragment = decodeURIComponent(window.location.hash.slice(1));
    } catch (e) {
      return;
    }
    if (!fragment || document.getElementById(fragment)) return;
    var target = findIgnoringCase(fragment);
    if (target) target.scrollIntoView();
  }

  window.addEventListener('hashchange', follow);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', follow);
  } else {
    follow();
  }
})();
