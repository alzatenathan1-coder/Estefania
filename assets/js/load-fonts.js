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
  function hidePreloader() {
    if (done) return;
    done = true;
    document.body.classList.add("site-ready");
    document.body.classList.remove("is-loading");
    setTimeout(function () {
      var el = document.getElementById("site-preloader");
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 900);
  }
  // Margen para que React haga su transición; si no lo hace, entra el failsafe.
  setTimeout(hidePreloader, 4000);
  if (document.readyState === "complete") {
    setTimeout(hidePreloader, 1200);
  } else {
    window.addEventListener("load", function () {
      setTimeout(hidePreloader, 1200);
    }, { once: true });
  }
})();
