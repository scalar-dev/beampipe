(function (window: Window, apiHost: string) {
  const location = window.location;
  const document = window.document;

  const isLocal =
    /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(
      location.hostname
    ) || location.protocol === "file:";

  const track = (event: string) => {
      console.log(document.visibilityState);
    const payload = {
      type: event,
      url:
        location.protocol +
        "//" +
        location.hostname +
        location.pathname +
        location.search,
      domain: isLocal ? "localhost" : location.host,
      referrer: document.referrer,
      userAgent: window.navigator.userAgent,
      source: location.search.match(
        /[?&](ref|source|utm_source)=([^?&]+)/
      )?.[2],
      screenWidth: window.innerWidth,
    };

    const request = new XMLHttpRequest();
    request.open("POST", apiHost, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(payload));
  };

  track("page_view");

})(window, "http://alysis.alexsparrow.dev/event");
