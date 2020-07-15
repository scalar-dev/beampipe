(function (window, apiHost) {
    var location = window.location;
    var document = window.document;
    var isLocal = /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(location.hostname) || location.protocol === "file:";
    var track = function (event) {
        var _a;
        console.log(document.visibilityState);
        var payload = {
            type: event,
            url: location.protocol +
                "//" +
                location.hostname +
                location.pathname +
                location.search,
            domain: isLocal ? "localhost" : location.host,
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
    track("page_view");
})(window, "http://alysis.alexsparrow.dev/event");
