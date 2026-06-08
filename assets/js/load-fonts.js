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
