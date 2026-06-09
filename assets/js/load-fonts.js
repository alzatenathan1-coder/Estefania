(function () {
  var links = document.querySelectorAll("link[data-async-font]");
  links.forEach(function (link) {
    if (link.sheet) {
      link.media = "all";
      return;
    }
    link.addEventListener("load", function () {
      link.media = "all";
    }, { once: true });
  });
})();

/* Failsafe del preloader: lo retira aunque React tarde o falle al montar.
   La app (React) también lo gestiona con una transición más cuidada; el
   primero que actúe gana. Sin esto, un fallo de carga dejaría el preloader fijo. */
(function () {
  var done = false;

  function appHasRendered() {
    var root = document.getElementById("root");
    return document.body.classList.contains("app-mounted") || !!(root && root.children.length);
  }

  function hidePreloader() {
    if (done || !appHasRendered()) return false;
    done = true;
    document.body.classList.add("site-ready");
    document.body.classList.remove("is-loading");
    setTimeout(function () {
      var el = document.getElementById("site-preloader");
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 900);
    return true;
  }

  function hideWhenAppIsReady() {
    if (hidePreloader()) return;

    var root = document.getElementById("root");
    if (!root || !window.MutationObserver) return;

    var observer = new MutationObserver(function () {
      if (hidePreloader()) observer.disconnect();
    });
    observer.observe(root, { childList: true });

    setTimeout(function () {
      observer.disconnect();
    }, 9000);
  }

  // Margen para que React haga su transición; si no lo hace, entra el failsafe.
  setTimeout(hideWhenAppIsReady, 4000);
})();
