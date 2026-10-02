/* The Download page's platform tabs, Bootstrap tabs: this only picks which one opens first,
 * the visitor's own system, and keeps the address in step. A link to #linux-x86_64,
 * #linux-arm64, #macos, #windows or #others opens that tab, from another page or this one. The panes' ids carry a "platform-" prefix so the
 * browser does not also scroll the page past the tabs to the pane. */
(function ($) {
    if (!$ || !$('.platform-tabs').length) return;

    function show(name) {
        var tab = $('#tab-' + name);
        if (tab.length) tab.tab('show');
        return tab.length > 0;
    }

    // The visitor's system from what the browser says. A Mac with Apple Silicon reports
    // "MacIntel" like an Intel one, and only Apple Silicon is supported, so any Mac gets
    // the macOS tab. Windows gets the WSL tab. Anything not recognised gets Linux x86_64.
    function guess() {
        var ua = navigator.userAgent || '';
        var platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
            navigator.platform || '';
        if (/mac/i.test(platform) || /Macintosh/.test(ua)) return 'macos';
        if (/win/i.test(platform) || /Windows/.test(ua)) return 'windows';
        if (/linux/i.test(platform) && /aarch64|arm64|armv8/i.test(platform + ' ' + ua)) return 'linux-arm64';
        return 'linux-x86_64';
    }

    // Chromium can say the architecture outright; on Linux that settles arm64 vs x86_64.
    function refine() {
        var data = navigator.userAgentData;
        if (!data || !data.getHighEntropyValues) return;
        data.getHighEntropyValues(['architecture']).then(function (values) {
            show(values.architecture === 'arm' ? 'linux-arm64' : 'linux-x86_64');
        }, function () {});
    }

    var named = location.hash.slice(1);
    if (!show(named)) {
        var guessed = guess();
        show(guessed);
        if (guessed === 'linux-x86_64' || guessed === 'linux-arm64') refine();
    }

    // A link within the page, like the WSL tab's to the Linux steps, changes only the hash.
    $(window).on('hashchange', function () {
        if (show(location.hash.slice(1))) $('.platform-tabs')[0].scrollIntoView({ block: 'nearest' });
    });

    // Only a tab the visitor picks goes into the address, not the one picked for them.
    $('.platform-tabs a[data-toggle="tab"]').on('click', function () {
        history.replaceState(null, '', '#' + this.id.replace(/^tab-/, ''));
    });
})(window.jQuery);
