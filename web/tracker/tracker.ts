(function (window: Window, apiHost: string) {
  if ((window as any).alysis) {
    return;
  }

  const location = window.location;
  const document = window.document;
  const history = window.history;

  const isLocal =
    /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(
      location.hostname
    ) || location.protocol === "file:";

  const ele = document.querySelector("[data-alysis-domain]");
  const domain =
    ele.getAttribute("data-alysis-domain") ||
    (isLocal ? "localhost" : location.host);

  const track = (event: string) => {
    if (isLocal) {
      console.warn("Ignoring in local mode");
      return;
    }

    const payload = {
      type: event,
      url:
        location.protocol +
        "//" +
        location.hostname +
        location.pathname +
        location.search,
      domain,
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

  const log = () => track("page_view");

  (window as any).alysis = track;

  if (history.pushState) {
    const pushState_ = history["pushState"];
    history.pushState = function () {
      pushState_.apply(this, arguments);
      log();
    };

    window.addEventListener("popstate", log);
  }

  log();
})(window, "https://alysis.alexsparrow.dev/event");
