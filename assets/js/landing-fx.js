// Efectos para las páginas de servicio: scroll suave (ratón), revelado al
// entrar en pantalla y entrada de la foto principal. Sin dependencias salvo Lenis.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  if (reduce) return;
  root.classList.add("fx");
  if (fine && window.Lenis) {
    new window.Lenis({ autoRaf: true, lerp: 0.085, anchors: { offset: -84 } });
    root.classList.add("has-lenis");
  }
  var sel = "main h2, main .body, main .item, main .faq-card, main .review, main .more-links a, main .visit-actions > *, main .list, .content .btn, main .section-head, main .card, main .step";
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  els.forEach(function (el, i) {
    el.classList.add("rv");
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.transitionDelay = Math.min(sib, 6) * 70 + "ms";
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach(function (el) { io.observe(el); });
  var photo = document.querySelector(".hero-photo img");
  if (photo) {
    var onScroll = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) photo.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0) scale(1.06)";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
