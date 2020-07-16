(function (window, apiHost) {
    if (window.alysis) {
        return;
    }
    var location = window.location;
    var document = window.document;
    var isLocal = /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(location.hostname) || location.protocol === "file:";
    var ele = document.querySelector("[data-alysis-domain]");
    var domain = ele.getAttribute("data-alysis-domain") || (isLocal ? "localhost" : location.host);
    var track = function (event) {
        var _a;
        var payload = {
            type: event,
            url: location.protocol +
                "//" +
                location.hostname +
                location.pathname +
                location.search,
            domain: domain,
            referrer: document.referrer,
            userAgent: window.navigator.userAgent,
            source: (_a = location.search.match(/[?&](ref|source|utm_source)=([^?&]+)/)) === null || _a === void 0 ? void 0 : _a[2],
            screenWidth: window.innerWidth
        };
        var request = new XMLHttpRequest();
        request.open("POST", apiHost, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(payload));
    };
    window.alysis = track;
    track("page_view");
})(window, "https://alysis.alexsparrow.dev/event");
