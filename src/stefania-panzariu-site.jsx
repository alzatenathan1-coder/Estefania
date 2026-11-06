const { useState, useEffect, useRef, useCallback } = React;

const BUSINESS = {
  name: "Stefania Panzariu Studio",
  tagline: "Belleza de Autor",
  phone: "34690699205",
  email: "estefaniapanzariu@gmail.com",
  instagramHandle: "@victoria_e_p",
  instagramUrl: "https://www.instagram.com/victoria_e_p?igsh=MWppMjdoaXlhYWxpOA==",
  // —— Dirección centralizada: para mudanzas, cambia SOLO estos campos ——
  addressLine: "Centro Comercial 4 Caminos, número 7", // calle + número (texto largo)
  addressShort: "Centro Comercial 4 Caminos, nº 7",     // versión corta
  postalCity: "16004 Cuenca",                            // CP + ciudad
  city: "Cuenca",
  region: "Cuenca",
  country: "España",
  area: "4 Caminos",                                     // barrio/zona (hero, branding)
  addressTag: "Número 7",                                // motivo de marca (footer/redes)
  landmark: "A pocos pasos de la Plaza de la Hispanidad.", // referencia cercana
  mapsShort: "https://maps.app.goo.gl/RmEoSxGfpnqJU6RFA",
  reviewsUrl: "https://share.google/glBQvfSFh7AWF6Wdg",
};

const BRAND_ASSETS = {
  logoBlack: "assets/brand/stefania-panzariu-logo-black-192.webp",
  logoWhite: "assets/brand/stefania-panzariu-logo-white-192.webp",
};

const SITE_IMAGES = {
  hero: "assets/images/stefania-panzariu-retrato-estudio-belleza-cuenca.jpg",
  artistTool: "assets/images/stefania-panzariu-micropigmentacion-dermografo-cuenca.jpg",
  pigmentDetail: "assets/images/micropigmentacion-pigmento-detalle.jpg",
  nailDetail: "assets/images/manicura-rusa-detalle-unas.jpg",
  browBefore: "assets/images/micropigmentacion-cejas-antes.jpg",
  browAfter: "assets/images/micropigmentacion-cejas-despues.jpg",
  nailMilky: "assets/images/manicura-rusa-milky-cuenca.jpg",
  nailNude: "assets/images/unas-nude-translucido-cuenca.jpg",
  facialCabin: "assets/images/cabina-estetica-facial-cuenca.jpg",
  massagePareja: "assets/images/masaje-en-pareja-spa-cuenca.jpg",
  massageDetail: "assets/images/masaje-relajante-detalle-manos.jpg",
};

// Variantes WebP generadas desde cada JPG: <nombre>-800.webp y <nombre>-<ancho>.webp
const IMG_LARGE_W = {
  [SITE_IMAGES.hero]: 1062,
  [SITE_IMAGES.artistTool]: 1206,
};
const pic = (src, sizes = "(max-width: 1080px) 100vw, 50vw") => {
  const base = src.replace(/\.jpg$/, "");
  const lw = IMG_LARGE_W[src] || 1600;
  return { src: `${base}-800.webp`, srcSet: `${base}-800.webp 800w, ${base}-${lw}.webp ${lw}w`, sizes };
};

const wa = (msg) => `https://wa.me/${BUSINESS.phone}?text=${encodeURIComponent(msg)}`;

// Mensaje estándar de cita (incluye la dirección centralizada).
const CITA_MSG = `Hola Stefania, me gustaría pedir cita en el estudio (${BUSINESS.addressLine}, ${BUSINESS.city}). ¿Me indicas tu disponibilidad?`;

/* ---------- Motor de efectos: cada elemento registrado recibe --p (0→1) ----------
   mode "through": 0 cuando el elemento asoma por abajo, 1 cuando sale por arriba.
   mode "pin":     0 cuando su borde superior toca el techo, 1 cuando su borde
                   inferior toca el suelo (para escenas fijadas con sticky). */
const FX = (() => {
  const items = new Set();
  let running = false;
  let idle = 0;
  const api = { lenis: null, ready: false };
  const frame = () => {
    const vh = window.innerHeight;
    const reads = [];
    items.forEach((it) => reads.push([it, it.el.getBoundingClientRect()]));
    for (const [it, r] of reads) {
      let p = it.mode === "pin" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (r.height + vh);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (it.p === undefined || Math.abs(p - it.p) > 0.0004) {
        it.p = p;
        it.el.style.setProperty("--p", p.toFixed(4));
        if (it.cb) it.cb(p, r);
      }
    }
    if (idle-- > 0) requestAnimationFrame(frame);else running = false;
  };
  api.wake = () => {
    idle = 30;
    if (!running && typeof window !== "undefined") {running = true;requestAnimationFrame(frame);}
  };
  api.add = (el, mode, cb) => {
    const it = { el, mode, cb };
    items.add(it);
    api.wake();
    return () => items.delete(it);
  };
  api.reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  api.fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  api.init = () => {
    if (typeof window === "undefined" || api.ready) return;
    api.ready = true;
    window.addEventListener("scroll", api.wake, { passive: true });
    window.addEventListener("resize", api.wake);
    window.addEventListener("load", api.wake);
    if (!api.reduce() && api.fine() && window.Lenis) {
      api.lenis = new window.Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true, anchors: { offset: -84 } });
      document.documentElement.classList.add("has-lenis");
    }
  };
  return api;
})();

function useProgress(mode = "through", cb) {
  const ref = useRef(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return FX.add(el, mode, (p, r) => cbRef.current && cbRef.current(p, r));
  }, [mode]);
  return ref;
}

/* Texto en círculo (SVG) que gira con el scroll de su sección */
function CircleText({ id, text, className = "" }) {
  return (
    <svg className={`circle-text ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
      </defs>
      <text><textPath href={`#${id}`}>{text}</textPath></text>
    </svg>);

}

/* Contador que sube al entrar en pantalla */
const Counter = React.memo(function Counter({ to, decimals = 0, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const fmt = (v) => v.toFixed(decimals).replace(".", ",");
  useEffect(() => {
    const el = ref.current;
    if (!el || FX.reduce()) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        el.textContent = prefix + fmt(to * (1 - Math.pow(1 - k, 4))) + suffix;
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {io.disconnect();cancelAnimationFrame(raf);};
  }, []);
  return <span ref={ref}>{prefix + fmt(to) + suffix}</span>;
});

/* Cursor propio + botones magnéticos (solo ratón, sin reduced-motion) */
function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!FX.fine() || FX.reduce()) return;
    setOn(true);
    document.documentElement.classList.add("has-cursor");
    let x = -100,y = -100,rx = -100,ry = -100,raf = 0,mag = null;
    const loop = () => {
      rx += (x - rx) * 0.2;ry += (y - ry) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => {
      x = e.clientX;y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      const m = e.target.closest && e.target.closest(".btn, .footer-cta, .wa-fab, .nav-dd-btn, .rv-nav");
      if (mag && mag !== m) {mag.style.transform = "";mag = null;}
      if (m) {
        mag = m;
        const r = m.getBoundingClientRect();
        m.style.transform = `translate3d(${((x - r.left - r.width / 2) * 0.22).toFixed(1)}px,${((y - r.top - r.height / 2) * 0.3).toFixed(1)}px,0)`;
      }
    };
    const over = (e) => {
      const r = ring.current;if (!r) return;
      const t = e.target.closest && e.target.closest("a, button, summary, [data-cursor], input[type=range]");
      r.classList.toggle("hover", !!t);
      r.dataset.label = t ? t.dataset.cursor || "" : "";
    };
    const leave = () => {x = -100;y = -100;if (!raf) raf = requestAnimationFrame(loop);};
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  if (!on) return null;
  return (
    <React.Fragment>
      <div className="cursor-dot" ref={dot} aria-hidden="true"></div>
      <div className="cursor-ring" ref={ring} aria-hidden="true"></div>
    </React.Fragment>);

}

/* ---------- Scroll progress bar ---------- */
function useScrollProgress() {
  useEffect(() => {
    const el = document.getElementById("scroll-progress");
    if (!el) return;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max * 100 : 0;
      el.style.width = p + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

/* ---------- Reveal hook ---------- */
function useReveal(opts = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // clip-path (r-mask) deja el elemento con área visible 0 y el observer no
    // lo detecta nunca: en ese caso se observa el contenedor padre.
    const target = el.matches(".r-mask, .r-mask-h") && el.parentElement ? el.parentElement : el;
    const threshold = target === el ? opts.threshold ?? 0.18 : 0.05;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            if (opts.once !== false) io.unobserve(target);
          } else if (opts.once === false) {
            el.classList.remove("in");
          }
        });
      },
      { threshold, rootMargin: opts.rootMargin ?? "0px 0px -8% 0px" }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return ref;
}

function R({ as = "div", v = "r-fade", delay = 0, instant = false, children, className = "", style, ...rest }) {
  const ref = useReveal();
  const Tag = as;
  // instant: visible desde el HTML prerenderizado, animado solo con CSS (hero)
  const s = instant ? { ...(style || {}), animationDelay: `${delay}ms` } : { ...(style || {}), transitionDelay: `${delay}ms` };
  return (
    <Tag ref={ref} className={`${v} ${className}${instant ? " in hero-anim" : ""}`} style={s} {...rest}>
      {children}
    </Tag>);

}

/* line-by-line reveal — every line in own .line-mask span */
function LineMask({ children, delay = 0, instant = false }) {
  const ref = useReveal();
  return (
    <span ref={ref} className={`line-mask${instant ? " in hero-anim" : ""}`} style={instant ? { animationDelay: `${delay}ms` } : { transitionDelay: `${delay}ms` }}>
      <span>{children}</span>
    </span>);

}

/* Word reveal */
function Words({ text, baseDelay = 0, step = 60, className = "" }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) =>
      <R as="span" v="r-word" delay={baseDelay + i * step} key={i} style={{ marginRight: "0.28em" }}>
          {w}
        </R>
      )}
    </span>);

}

/* Parallax wrapper */
function Parallax({ speed = 0.18, children, className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      raf = 0;
    };
    const on = () => {if (!raf) raf = requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {window.removeEventListener("scroll", on);window.removeEventListener("resize", on);cancelAnimationFrame(raf);};
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform", ...(style || {}) }}>{children}</div>;
}

/* Ghost section number that drifts vertically with scroll */
function GhostNum({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * 0.12).toFixed(1)}px, 0)`;
      raf = 0;
    };
    const on = () => {if (!raf) raf = requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div ref={ref} className="ghost-num">{children}</div>;
}

/* ---------- Interludio: la imagen crece desde un marco hasta ocupar la pantalla ---------- */
function Interlude({ id, src, placeholder, label, quote, pos = "50% 50%" }) {
  const ref = useProgress("through");
  return (
    <section className="interlude" id={id} ref={ref}>
      <div className="frame">
        <div className="photo">
          <img className="cover-img" {...pic(src, "100vw")} alt={placeholder} style={{ objectPosition: pos }} loading="lazy" />
        </div>
        <div className="legend">
          <R v="r-fade" className="ital">{quote}</R>
          <R v="r-right" as="span">{label}</R>
        </div>
      </div>
    </section>);

}

/* ---------- Drawer (slide-out menu) ---------- */
function Drawer({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {document.body.style.overflow = "";};
  }, [open]);

  const links = [
  { href: "#unas", label: "Uñas", idx: "01" },
  { href: "#masajes", label: "Masajes", idx: "02" },
  { href: "#estetica", label: "Estética facial", idx: "03" },
  { href: "#corporal", label: "Estética corporal", idx: "04" },
  { href: "#micropigmentacion", label: "Micropigmentación", idx: "05" },
  { href: "#testimonios", label: "Reseñas", idx: "06" },
  { href: "#trayectoria", label: "Sobre Stefania", idx: "07" },
  { href: "#faq", label: "Preguntas", idx: "08" },
  { href: "#contacto", label: "Contacto y horario", idx: "09" },
  { href: "/servicios", label: "Todos los servicios", idx: "→" }];


  return (
    <div className={`drawer-overlay ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
      <div className="scrim" onClick={onClose}></div>
      <aside className="drawer" role="dialog" aria-label="Menú">
        <div className="drawer-top">
          <span className="brand-mark">
            <img className="logo-img on-light" src={BRAND_ASSETS.logoWhite} alt={BUSINESS.name} width="40" height="40" style={{ height: 40 }} />
          </span>
          <button className="drawer-close" onClick={onClose} aria-label="Cerrar menú"></button>
        </div>
        <nav className="drawer-links">
          {links.map((l) =>
          <a key={l.href} href={l.href} onClick={onClose}>
              <span>{l.label}</span>
              <span className="idx">{l.idx}</span>
            </a>
          )}
        </nav>
        <div className="drawer-foot">
          <div>
            <div className="label">Dónde estamos</div>
            <div className="addr">{BUSINESS.addressLine}<br />{BUSINESS.postalCity}</div>
            <div className="addr" style={{ fontSize: 15, marginTop: 6 }}>Lunes a viernes · 9:00 a 21:00</div>
          </div>
          <div>
            <div className="label">Síguenos</div>
            <div className="row">
              <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href={BUSINESS.mapsShort} target="_blank" rel="noopener" aria-label="Ubicación en Google Maps">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" />
                </svg>
              </a>
            </div>
          </div>
          <a className="btn dark" href={wa(CITA_MSG)} onClick={onClose} target="_blank" rel="noopener">
            Pedir cita por WhatsApp <span className="arrow">→</span>
          </a>
          <a className="btn" href={`tel:+${BUSINESS.phone}`} onClick={onClose}>
            Llamar al 690 699 205
          </a>
        </div>
      </aside>
    </div>);

}

/* ---------- Dropdown ---------- */
function NavDropdown({ label, dark = false, panelClass = "", children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {if (e.key === "Escape") setOpen(false);};
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {document.removeEventListener("mousedown", onClick);document.removeEventListener("keydown", onKey);};
  }, []);
  return (
    <div className={`nav-dd ${open ? "open" : ""}`} ref={ref}>
      <button className={`nav-dd-btn ${dark ? "dark" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {label}
        <span className="chev"></span>
      </button>
      <div className={`nav-dd-panel ${panelClass} ${align === "right" ? "right-align" : ""}`} onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>);

}

/* ---------- Nav ---------- */
function Nav() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > window.innerHeight * 0.6) setHidden(true);else
      if (y < lastY - 6 || y < 80) setHidden(false);
      lastY = y;
      // Aparece elegantemente cuando pasas el hero (≈ 88% del viewport)
      setVisible(y > window.innerHeight * 0.88);
      // Sombra y padding extra al haber scrolleado más
      setScrolled(y > window.innerHeight * 1.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const Ig =
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none" />
    </svg>;

  const Em =
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
    </svg>;

  const Wa =
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.6-4.6A9 9 0 1 1 8 20.4L3 21z" />
      <path d="M8.5 9c.2 1 .9 2.4 2 3.5s2.5 1.8 3.5 2c.4 0 .9-.1 1.2-.5l.6-.8a.8.8 0 0 0-.2-1.1l-1.3-.8a.8.8 0 0 0-1 .2l-.3.4c-.7-.3-1.4-.7-1.9-1.2s-.9-1.2-1.2-1.9l.4-.3a.8.8 0 0 0 .2-1l-.8-1.3a.8.8 0 0 0-1.1-.2L8 6.6c-.4.3-.5.8-.5 1.2 0 .4.4.8 1 1.2z" />
    </svg>;

  const Pin =
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" />
    </svg>;

  const Car =
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h2l1.4-4.7A2 2 0 0 1 8.3 11h7.4a2 2 0 0 1 1.9 1.3L19 17h2"/>
      <path d="M5 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M16 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2"/>
      <circle cx="7.5" cy="14.5" r=".8"/><circle cx="16.5" cy="14.5" r=".8"/>
    </svg>;

  const mapsLink = BUSINESS.mapsShort;
  const ctaMsg = CITA_MSG;

  return (
    <React.Fragment>
      <header className={`nav ${visible ? "visible" : ""} ${scrolled ? "scrolled" : ""} ${hidden && !drawerOpen ? "nav-hidden" : ""}`}>
        <a href="#top" className="brand-mark" aria-label={BUSINESS.name}>
          <img className="logo-img on-dark" src={BRAND_ASSETS.logoBlack} alt={BUSINESS.name} width="46" height="46" />
        </a>
        <nav className="nav-links">
          <a href="/servicios">Servicios</a>
          <a href="#unas">Uñas</a>
          <a href="#masajes">Masajes</a>
          <a href="#estetica">Estética</a>
          <a href="#testimonios">Reseñas</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <div className="nav-cta">
          <NavDropdown label={<><span className="lead-ic">{Pin}</span>Encuéntranos</>} panelClass="socials">
            <a className="item" href={wa(ctaMsg)} target="_blank" rel="noopener">
              <span className="ic">{Wa}</span>
              <span className="meta">
                <span className="t">Pedir cita por WhatsApp</span>
                <span className="h">Respuesta personal en minutos</span>
              </span>
              <span className="arrow">→</span>
            </a>
            <a className="item" href={BUSINESS.instagramUrl} target="_blank" rel="noopener">
              <span className="ic">{Ig}</span>
              <span className="meta">
                <span className="t">Instagram</span>
                <span className="h">{BUSINESS.instagramHandle}</span>
              </span>
              <span className="arrow">→</span>
            </a>
          </NavDropdown>

          <NavDropdown label={<><span className="lead-ic">{Car}</span>Ubicación</>} dark>
            <a className="item" href={mapsLink} target="_blank" rel="noopener">
              <span className="ic">{Pin}</span>
              <span className="meta">
                <span className="t">{BUSINESS.addressShort}</span>
                <span className="h">{BUSINESS.postalCity} · {BUSINESS.country}</span>
              </span>
              <span className="arrow">→</span>
            </a>
            <a className="item" href={mapsLink} target="_blank" rel="noopener">
              <span className="ic">{Car}</span>
              <span className="meta">
                <span className="t">Cómo llegar</span>
                <span className="h">Abrir en Google Maps</span>
              </span>
              <span className="arrow">→</span>
            </a>
            <a className="item" href="#contacto">
              <span className="ic">{Em}</span>
              <span className="meta">
                <span className="t">Horario · Lun-Vie</span>
                <span className="h">9:00 – 21:00 · cita previa</span>
              </span>
              <span className="arrow">→</span>
            </a>
          </NavDropdown>
        </div>
      </header>

      {/* Floating menu button — sólo móvil (CSS lo oculta en desktop) */}
      <button className={`float-menu nav-menu-btn ${drawerOpen ? "open" : ""}`}
      onClick={() => setDrawerOpen(true)} aria-label="Abrir menú">
        <span className="lines"></span>
      </button>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </React.Fragment>);

}

/* ---------- Hero: escena fijada, la foto se recoge en arco al bajar ---------- */
function Hero() {
  const ref = useProgress("pin");
  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-sticky">
        <div className="hero-word" aria-hidden="true">Stefania</div>
        <div className="hero-inner">
          <div className="hero-text">
            <R v="r-fade" delay={0} instant>
              <h1 className="kicker">Uñas, masajes y estética en Cuenca</h1>
            </R>

            <p className="display">
              <LineMask delay={100} instant>El arte</LineMask>
              <LineMask delay={200} instant>de sentirte</LineMask>
              <LineMask delay={300} instant><em style={{ fontFamily: "var(--display)", fontStyle: "normal" }}>bien.</em></LineMask>
            </p>

            <R className="lead" delay={450} instant>
              Soy Stefania. En mi estudio de 4 Caminos hago uñas, masajes (también
              en pareja), tratamientos faciales y corporales y micropigmentación.
              Trabajo con cita previa para atenderte sin prisas.
            </R>

            <R className="hero-actions" delay={550} instant>
              <a className="btn dark" href={wa(CITA_MSG)} target="_blank" rel="noopener">
                Pedir cita por WhatsApp <span className="arrow">→</span>
              </a>
              <a className="btn" href="#que-hago">Ver servicios</a>
            </R>
          </div>

          <div className="hero-photo">
            <div className="inner">
              <img
                className="cover-img"
                {...pic(SITE_IMAGES.hero)}
                alt="Stefania Panzariu, fundadora del estudio de belleza de autor en Cuenca, especialista en micropigmentación y uñas"
                style={{ objectPosition: "50% 20%" }}
                width="1062" height="1509"
                fetchpriority="high"
                loading="eager" />
            </div>
            <div className="hero-caption" aria-hidden="true">
              <span>Stefania Panzariu</span>
              <span>Fundadora · {BUSINESS.city}</span>
            </div>
          </div>
        </div>

        <div className="hero-meta">
          <div><span className="num">— </span>{BUSINESS.city} · {BUSINESS.country}</div>
          <div>EST · {BUSINESS.area}</div>
          <div><span className="num">— </span>Belleza de autor</div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Desliza</span>
          <span className="bar"></span>
        </div>
      </div>
    </section>);

}

/* ---------- Cinta de servicios que se desplaza con el scroll ---------- */
function Marquee() {
  const ref = useProgress("through");
  const words = ["Uñas de autor", "Masajes", "Estética facial", "Estética corporal", "Micropigmentación"];
  const group = (k, hidden) =>
  <span className="mq-group" key={k} aria-hidden={hidden ? "true" : undefined}>
      {words.map((w) =>
    <React.Fragment key={w}><span className="mq-word">{w}</span><span className="mq-star">✦</span></React.Fragment>
    )}
    </span>;

  return (
    <section className="marquee" ref={ref} aria-label="Servicios del estudio">
      <div className="mq-row"><div className="mq-track">{group(0, false)}{group(1, true)}{group(2, true)}</div></div>
      <div className="mq-row mq-outline" aria-hidden="true"><div className="mq-track">{group(3, true)}{group(4, true)}{group(5, true)}</div></div>
    </section>);

}

/* ---------- Índice de servicios con vista previa que sigue al ratón ---------- */
function QuickServices() {
  const items = [
  { href: "#unas", t: "Uñas", d: "Manicura de precisión, rubber base, milky y diseños.", img: SITE_IMAGES.nailMilky },
  { href: "#masajes", t: "Masajes", d: "Relajantes, con aromaterapia o en pareja.", img: SITE_IMAGES.massagePareja },
  { href: "#estetica", t: "Estética facial", d: "Limpieza profunda y tratamientos para dar luz.", img: SITE_IMAGES.facialCabin },
  { href: "#corporal", t: "Estética corporal", d: "Maderoterapia, drenaje linfático y envolturas.", img: SITE_IMAGES.massageDetail },
  { href: "#micropigmentacion", t: "Micropigmentación", d: "Cejas, labios y eyeliner con boceto previo.", img: SITE_IMAGES.browAfter }];

  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const figRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current,fig = figRef.current;
    if (!wrap || !fig || !FX.fine()) return;
    let x = 0,y = 0,tx = 0,ty = 0,raf = 0;
    const loop = () => {
      x += (tx - x) * 0.14;y += (ty - y) * 0.14;
      fig.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${((tx - x) * 0.04).toFixed(2)}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => {
      const r = wrap.getBoundingClientRect();
      tx = e.clientX - r.left;ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    wrap.addEventListener("pointermove", move);
    return () => {wrap.removeEventListener("pointermove", move);cancelAnimationFrame(raf);};
  }, []);

  return (
    <section className="quick-services" id="que-hago" aria-labelledby="qs-title">
      <div className="container">
        <div className="qs-head">
          <h2 id="qs-title" className="small-caps">Qué puedes reservar</h2>
          <span className="qs-hint">Lunes a viernes · 9:00 a 21:00 · Solo con cita previa</span>
        </div>
        <div className="qs-wrap" ref={wrapRef} onPointerLeave={() => setActive(-1)}>
          <ul className={`qs-list ${active >= 0 ? "has-active" : ""}`}>
            {items.map((it, i) =>
            <li key={it.href} className={active === i ? "is-active" : ""}>
                <a href={it.href} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(-1)} data-cursor="Ver">
                  <span className="qs-n">{`0${i + 1}`}</span>
                  <span className="qs-t">{it.t}</span>
                  <span className="qs-d">{it.d}</span>
                  <img className="qs-thumb" src={pic(it.img).src} alt="" loading="lazy" width="64" height="80" />
                  <span className="qs-a" aria-hidden="true">→</span>
                </a>
              </li>
            )}
          </ul>
          <div className={`qs-preview ${active >= 0 ? "on" : ""}`} ref={figRef} aria-hidden="true">
            {items.map((it, i) =>
            <img key={it.href} className={active === i ? "on" : ""} src={pic(it.img).src} alt="" loading="lazy" />
            )}
          </div>
        </div>
        <p className="qs-note"><a href="#contacto">Cómo llegar al estudio <span aria-hidden="true">→</span></a></p>
      </div>
    </section>);

}

/* ---------- Masajes: pantalla dividida, la imagen cambia con máscara al avanzar ---------- */
function MassageSection() {
  const steps = [
  { label: "En pareja", t: "Masaje en pareja · Ritual dúo", d: "Dos camillas, una misma cabina: comparte un ritual relajante con tu pareja, una amiga o en familia, en un ambiente cálido e íntimo.", img: SITE_IMAGES.massagePareja, alt: "Masaje en pareja en el estudio de Stefania Panzariu en Cuenca", pos: "50% 50%" },
  { label: "Relajante", t: "Masaje relajante", d: "Maniobras suaves y envolventes para soltar la tensión acumulada y salir con el cuerpo más ligero.", img: SITE_IMAGES.massageDetail, alt: "Detalle de masaje relajante de espalda en Stefania Panzariu Studio", pos: "50% 40%" },
  { label: "Experiencia", t: "Aromaterapia y calma", d: "Aceites esenciales, luz cálida y silencio. Ajustamos la presión y la duración a lo que necesites.", img: SITE_IMAGES.facialCabin, alt: "Cabina del estudio con luz cálida y velas", pos: "50% 50%" }];

  const [active, setActive] = useState(0);
  const mediaRef = useRef(null);
  const splitRef = useProgress("pin", (p) => {
    const n = steps.length - 1;
    const s = p * n;
    const m = mediaRef.current;
    if (m) for (let i = 1; i <= n; i++) {
      const r = Math.min(1, Math.max(0, (s - (i - 0.62)) / 0.62));
      m.style.setProperty(`--r${i}`, r.toFixed(4));
    }
    const a = Math.min(n, Math.max(0, Math.round(s)));
    setActive((prev) => prev === a ? prev : a);
  });

  return (
    <section className="sec-massage" id="masajes">
      <GhostNum>02</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Masajes en Cuenca · Relajante y en pareja</span>
        </R>
        <div className="grid-2 end">
          <h2 className="h-section">
            <LineMask>Un paréntesis</LineMask>
            <LineMask delay={120}>para <em style={{ fontFamily: "var(--serif)" }}>dos</em>.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Puedes venir sola o acompañada: con tu pareja, una amiga o alguien de tu
            familia. Aceites esenciales, luz cálida y la presión que tú prefieras.
          </R>
        </div>
      </div>

      <div className="split" ref={splitRef}>
        <div className="split-media" ref={mediaRef} aria-hidden="true">
          {steps.map((s, i) =>
          <figure key={s.t} className={`sm-fig sm-${i}`}>
              <img className="cover-img" {...pic(s.img)} alt="" style={{ objectPosition: s.pos }} loading="lazy" />
            </figure>
          )}
          <div className="sm-counter">
            <span className="cur">{`0${active + 1}`}</span><span className="sep"></span><span>{`0${steps.length}`}</span>
          </div>
          <div className="sm-label">{steps[active].label}</div>
        </div>
        <div className="split-steps">
          {steps.map((s, i) =>
          <article key={s.t} className={`split-step ${active === i ? "is-active" : ""}`}>
              <div className="step-img"><img className="cover-img" {...pic(s.img)} alt={s.alt} style={{ objectPosition: s.pos }} loading="lazy" /></div>
              <div className="step-n">{`0${i + 1}`} · {s.label}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              {i === steps.length - 1 &&
            <a className="btn dark" href={wa("Hola Stefania, me gustaría reservar un masaje en pareja / relajante.")} target="_blank" rel="noopener">
                  Reservar mi masaje <span className="arrow">→</span>
                </a>
            }
            </article>
          )}
        </div>
      </div>
    </section>);

}

/* ---------- Antes / después arrastrable ---------- */
function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || FX.reduce()) return;
    let raf = 0,t0 = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const run = (t) => {
        if (!t0) t0 = t;
        const k = (t - t0) / 2200;
        if (k >= 1) {setPos(50);return;}
        setPos(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
        raf = requestAnimationFrame(run);
      };
      raf = requestAnimationFrame(run);
    }, { threshold: 0.55 });
    io.observe(el);
    return () => {io.disconnect();cancelAnimationFrame(raf);};
  }, []);
  return (
    <div className="ba-slider" ref={ref} style={{ "--pos": `${pos}%` }}>
      <img className="ba-img" {...pic(SITE_IMAGES.browBefore)} alt="Cejas antes de la micropigmentación" loading="lazy" />
      <div className="ba-side after">
        <img className="ba-img" {...pic(SITE_IMAGES.browAfter)} alt="Las mismas cejas después de la micropigmentación" loading="lazy" />
      </div>
      <div className="ba-divider"></div>
      <div className="ba-handle"></div>
      <span className="ba-label left">Antes</span>
      <span className="ba-label right">Después</span>
      <input className="ba-range" type="range" min="0" max="100" step="1" value={Math.round(pos)}
      onChange={(e) => setPos(Number(e.target.value))} aria-label="Comparar antes y después" data-cursor="Desliza" />
    </div>);

}

/* ---------- Micropigmentación ---------- */
function MicroSection() {
  const methods = [
  {
    n: "01",
    t: "Cejas pelo a pelo o sombreado",
    d: "Estudio la forma de tu cara, la dirección de tu vello y el tono de tu piel para que las cejas parezcan tuyas. No empiezo hasta que apruebes el boceto a lápiz."
  },
  {
    n: "02",
    t: "Labios · Lip blush",
    d: "Recupera el contorno de los labios y les da un tono más vivo, con un acabado natural."
  },
  {
    n: "03",
    t: "Eyeliner degradado",
    d: "Una sombra suave en el párpado que marca la mirada sin la línea dura de un delineado."
  }];

  return (
    <section className="sec-micro sec-micro-secondary" id="micropigmentacion">
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">También en el estudio · Micropigmentación</span>
        </R>

        <div className="grid-2 end">
          <h2 className="h-sub">
            <LineMask>Cejas, labios y mirada</LineMask>
            <LineMask delay={120}>con aspecto natural.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Antes de empezar hago un boceto, y no pigmento nada hasta que te guste.
            Uso pigmentos registrados en la AEMPS y agujas de un solo uso. Si tienes
            dudas, pregúntame por WhatsApp.
          </R>
        </div>

        <R v="r-fade" className="ba-wrap"><BeforeAfter /></R>

        <div className="methods-list compact">
          {methods.map((m, i) =>
          <R as="div" key={m.n} className="row" v="r-left" delay={i * 80}>
              <div className="n">{m.n}</div>
              <div>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
              </div>
            </R>
          )}
        </div>

        <R style={{ marginTop: 48 }}>
          <a className="linkish" href="/micropigmentacion">
            Cómo es el proceso, cuidados y retoque <span className="arrow">→</span>
          </a>
          <span style={{ display: "inline-block", width: 28 }}></span>
          <a className="linkish" href={wa("Hola Stefania, me gustaría recibir más información sobre micropigmentación.")} target="_blank" rel="noopener">
            Preguntar por WhatsApp <span className="arrow">→</span>
          </a>
        </R>
      </div>
    </section>);

}

/* ---------- Nails ---------- */
function NailsSection() {
  return (
    <section className="sec-nails" id="unas">
      <GhostNum>01</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Uñas en Cuenca · Manicura de autor</span>
        </R>

        <div className="grid-2 end">
          <h2 className="h-section">
            <LineMask>La manicura</LineMask>
            <LineMask delay={120}>que <em style={{ fontFamily: "var(--serif)" }}>fortalece</em></LineMask>
            <LineMask delay={240}>desde la raíz.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Unas uñas bonitas no salen de taparlas con capas gruesas. Primero cuido
            tu uña natural y después le damos forma, color y el diseño que te guste.
          </R>
        </div>

        <div className="nails-stage">
          <div className="col-photos">
            <R v="r-mask" className="img">
              <Parallax speed={0.08} className="inner">
                <img className="cover-img" {...pic(SITE_IMAGES.nailMilky)} alt="Uñas de autor con acabado milky en Stefania Panzariu Studio" loading="lazy" />
              </Parallax>
            </R>
            <R v="r-fade" delay={120} className="quote-tile">
              <span className="mark">✦</span>
              <p>“Son 7 años haciéndome las uñas con ella y jamás se me ha partido o caído una uña.”</p>
              <span className="sign">Rebeca · Reseña en Google</span>
            </R>
            <R v="r-mask" delay={200} className="img">
              <Parallax speed={0.12} className="inner">
                <img className="cover-img" {...pic(SITE_IMAGES.nailNude)} alt="Uñas nude translúcidas con acabado limpio y natural" loading="lazy" />
              </Parallax>
            </R>
          </div>

          <div className="col-text">
            <R className="kicker" style={{ marginBottom: 16 }}>Acabados naturales y diseños</R>
            <R as="h3" className="h-sub" delay={120} style={{ maxWidth: "20ch" }}>
              Tonos lechosos, nudes translúcidos o el diseño que traigas en mente.
            </R>
            <div className="nails-features">
              <R as="div" className="feat" v="r-left">
                <div className="label">Técnica</div>
                <div>
                  <h4>Manicura de alta precisión</h4>
                  <p>Trabajo la cutícula con calma y herramientas específicas para que el esmalte empiece justo en el borde de la piel.</p>
                </div>
              </R>
              <R as="div" className="feat" v="r-left" delay={120}>
                <div className="label">Refuerzo</div>
                <div>
                  <h4>Nivelación y rubber base</h4>
                  <p>Una base flexible que corrige pequeñas imperfecciones y refuerza la uña natural. Dura más de 3 semanas.</p>
                </div>
              </R>
              <R as="div" className="feat" v="r-left" delay={240}>
                <div className="label">Estética</div>
                <div>
                  <h4>Milky, nude y diseños a tu gusto</h4>
                  <p>Colores suaves que quedan bien con todo, o algo más atrevido. Lo adaptamos a la forma de tu mano.</p>
                </div>
              </R>
            </div>

            <R delay={300} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola Stefania, quiero pedir cita para hacerme las uñas.")} target="_blank" rel="noopener">
                Pedir cita para uñas <span className="arrow">→</span>
              </a>
              <a className="linkish" href="/unas-de-autor" style={{ marginLeft: 22 }}>
                Más sobre las uñas <span className="arrow">→</span>
              </a>
            </R>
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Facial ---------- */
function FacialSection() {
  const ref = useProgress("through");
  return (
    <section className="sec-facial" id="estetica" ref={ref}>
      <GhostNum>03</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Estética facial avanzada</span>
        </R>

        <div className="facial-grid">
          <div className="facial-photos">
            <div className="facial-badge" aria-hidden="true">
              <CircleText id="ct-facial" text="Estética facial · Cuenca · Piel luminosa · " />
              <span className="core">✦</span>
            </div>
            <R v="r-mask" className="p1">
              <Parallax speed={0.08} className="inner">
                <img className="cover-img" {...pic(SITE_IMAGES.facialCabin)} alt="Cabina de estética facial avanzada con luz cálida" loading="lazy" />
              </Parallax>
            </R>
            <R v="r-mask" delay={200} className="p2">
              <Parallax speed={0.14} className="inner">
                <img className="cover-img" {...pic(SITE_IMAGES.pigmentDetail)} alt="Detalle de pigmentos y material de trabajo en el estudio" loading="lazy" />
              </Parallax>
            </R>
          </div>

          <div>
            <h2 className="h-section" style={{ marginBottom: 28 }}>
              <LineMask>Una piel más limpia</LineMask>
              <LineMask delay={120}>y luminosa.</LineMask>
            </h2>
            <R className="lead" delay={200}>
              Limpieza facial profunda y tratamientos para la piel apagada o con el
              tono irregular, en una cabina tranquila y sin prisas.
            </R>

            <div className="ritual-list">
              <R as="div" v="r-left" className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Limpieza facial profunda</h3>
                  <p>Higiene profesional para sacar impurezas, oxigenar la piel y notarla suave al momento.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={60} className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Brightening Action</h3>
                  <p>Tratamiento despigmentante e iluminador que unifica el tono y reduce imperfecciones. Se nota desde la primera sesión.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={120} className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Argi-Mask White · Arcilla blanca</h3>
                  <p>Mascarilla oxigenante que limpia y equilibra la piel cansada. La deja fresca y suave.</p>
                </div>
              </R>
            </div>

            <R delay={280} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola Stefania, me gustaría pedir cita para un tratamiento facial.")} target="_blank" rel="noopener">
                Pedir cita para un facial <span className="arrow">→</span>
              </a>
              <a className="linkish" href="/estetica-facial" style={{ marginLeft: 22 }}>
                Ver tratamientos <span className="arrow">→</span>
              </a>
            </R>
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Armonía Corporal ---------- */
function BodySection() {
  const ref = useProgress("through");
  return (
    <section className="sec-body" id="corporal" ref={ref}>
      <GhostNum>04</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Estética corporal</span>
        </R>

        <div className="body-grid">
          <div className="body-text">
            <h2 className="h-section" style={{ marginBottom: 28 }}>
              <LineMask>Reconectar con</LineMask>
              <LineMask delay={120}>tu <em style={{ fontFamily: "var(--serif)" }}>cuerpo</em>.</LineMask>
            </h2>
            <R className="lead" delay={200}>
              Terapias manuales para soltar tensión, mejorar la circulación y
              trabajar la silueta.
            </R>

            <div className="ritual-list">
              <R as="div" v="r-left" className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Maderoterapia</h3>
                  <p>Instrumentos de madera para tonificar, mejorar la circulación y trabajar las zonas con celulitis.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={120} className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Drenaje Linfático</h3>
                  <p>Maniobras suaves que alivian la sensación de piernas cansadas y ayudan con la retención de líquidos.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={240} className="it">
                <div className="mark">✦</div>
                <div>
                  <h3>Exfoliación y Envoltura</h3>
                  <p>Renueva la piel y la deja hidratada, más firme y luminosa.</p>
                </div>
              </R>
            </div>

            <R delay={320} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola Stefania, me gustaría pedir cita para un tratamiento corporal.")} target="_blank" rel="noopener">
                Pedir cita para corporal <span className="arrow">→</span>
              </a>
              <a className="linkish" href="/rituales-corporales" style={{ marginLeft: 22 }}>
                Ver tratamientos <span className="arrow">→</span>
              </a>
            </R>
          </div>

          <div className="body-visual">
            <R v="r-fade" delay={300}>
              <div className="body-visual-deco">
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="center-mark">✦</div>
              </div>
            </R>
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Trayectoria: recorrido horizontal fijado (escritorio) ---------- */
function TrackSection() {
  const trackRef = useRef(null);
  const distRef = useRef(0);
  const wide = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1081px)").matches;
  const hzRef = useProgress("pin", (p) => {
    const t = trackRef.current;
    if (!t) return;
    t.style.transform = wide() && !FX.reduce() ? `translate3d(${(-p * distRef.current).toFixed(1)}px,0,0)` : "";
  });
  useEffect(() => {
    const t = trackRef.current,hz = hzRef.current;
    if (!t || !hz) return;
    const measure = () => {
      if (wide() && !FX.reduce()) {
        distRef.current = Math.max(0, t.scrollWidth - window.innerWidth);
        hz.style.height = `${distRef.current + window.innerHeight}px`;
      } else {
        distRef.current = 0;
        hz.style.height = "";
        t.style.transform = "";
      }
      FX.wake();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("resize", measure);
    return () => {ro.disconnect();window.removeEventListener("resize", measure);};
  }, []);

  const steps = [
  {
    t: "Competir a nivel nacional",
    d: "Participé en el campeonato The Beauty Experts de Valencia, junto a profesionales del maquillaje permanente de toda España.",
    tag: "El reconocimiento",
    src: SITE_IMAGES.artistTool,
    alt: "Stefania Panzariu con su dermógrafo de micropigmentación en el estudio de Cuenca",
    pos: "50% 28%"
  },
  {
    t: "Formarme fuera",
    d: "Asistí al World PMU Congress 2026, a bordo del MSC Fantasia, para conocer las técnicas de micropigmentación que se usan en otros países.",
    tag: "El congreso mundial",
    src: SITE_IMAGES.hero,
    alt: "Retrato de Stefania Panzariu, artista de micropigmentación y belleza de autor en Cuenca",
    pos: "50% 18%"
  },
  {
    t: "Traerlo a Cuenca",
    d: "Lo que aprendo fuera lo aplico aquí, en el estudio de 4 Caminos, con cada clienta.",
    tag: "La misión",
    src: SITE_IMAGES.facialCabin,
    alt: "Cabina del estudio Stefania Panzariu en Cuenca",
    pos: "50% 50%"
  }];

  return (
    <section className="sec-track" id="trayectoria">
      <div className="hz" ref={hzRef}>
        <div className="hz-sticky">
          <div className="hz-track" ref={trackRef}>
            <div className="hz-panel hz-intro">
              <R className="chapter">
                <span className="rule" style={{ background: "rgba(255,255,255,.5)" }}></span>
                <span className="small-caps">Formación y trayectoria</span>
              </R>
              <h2 className="h-section">
                <LineMask>Sobre</LineMask>
                <LineMask delay={120}>Stefania.</LineMask>
              </h2>
              <R className="body" delay={200} style={{ color: "rgba(255,255,255,.72)" }}>
                Sigo formándome y compitiendo para hacer mejor mi trabajo. Estos son
                algunos momentos de ese camino.
              </R>
              <span className="hz-hint" aria-hidden="true">Sigue bajando <span>→</span></span>
            </div>
            {steps.map((s, i) =>
            <article key={s.t} className="hz-panel hz-step">
                <div className="img-wrap">
                  <img className="cover-img" {...pic(s.src)} alt={s.alt} style={{ objectPosition: s.pos }} loading="lazy" />
                </div>
                <div className="text">
                  <div className="n">{`0${i + 1}`} · {s.tag}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </article>
            )}
            <div className="hz-panel hz-outro">
              <p className="hz-quote">¿Hablamos de tu próxima cita?</p>
              <a className="btn rose" href={wa(CITA_MSG)} target="_blank" rel="noopener">Pedir cita <span className="arrow">→</span></a>
            </div>
          </div>
          <div className="hz-progress" aria-hidden="true"><span></span></div>
        </div>
      </div>
    </section>);

}

/* ---------- Reseñas: cita destacada que rota + dos cintas de reseñas ---------- */
function TestimonialsSection() {
  const reviews = [
    { name: "Cecilia Gil Navarro", service: "Estética facial", date: "Hace 3 días", tags: ["facial", "experiencia"], text: "Como siempre, una experiencia maravillosa. Nunca deja de sorprenderme por su profesionalidad, dedicación y el cariño con el que realiza cada tratamiento.", a: "C" },
    { name: "P. María del Carmen", service: "Facial y labios", date: "Hace 3 días", tags: ["facial", "micro"], text: "Resultados espectaculares. No puedo estar más feliz con el resultado. El tratamiento facial dejó mi piel luminosa e hidratada.", a: "M" },
    { name: "Maria IM", service: "Limpieza facial", date: "Hace una semana", tags: ["facial", "experiencia"], text: "He salido encantada con la limpieza facial. Desde que entras por la puerta te sientes como en casa: ambiente acogedor, trato cercano y muy profesional.", a: "M" },
    { name: "Carmen Lopez Sanabria", service: "Atención y paciencia", date: "Hace 2 semanas", tags: ["experiencia"], text: "Estefanía, un amor como siempre. Ama lo que hace y la atención es un 10. Sobre todo tiene mucha paciencia.", a: "C" },
    { name: "Isabel Aranda Garcia", service: "Trato profesional", date: "Hace 3 semanas", tags: ["experiencia"], text: "Profesional a tope y muy amable. La recomiendo al 100%.", a: "I" },
    { name: "Maria Mercedes Felipe Auñón", service: "Sombreado de cejas", date: "Hace 3 semanas", tags: ["micro"], text: "Me hice un sombreado de cejas y me quedaron espectaculares. Tenía tatuaje por debajo y ha sido todo un acierto. Recomendado 100%.", a: "M" },
    { name: "Eden Niknafs", service: "Uñas y maquillaje permanente", date: "Hace 3 semanas", tags: ["unas", "micro"], text: "I have been visiting Estefania for my nails and have been delighted with her work. She is a true professional and talented technician.", a: "E" },
    { name: "Conchi Pérez Real", service: "Todos los tratamientos", date: "Hace 3 semanas", tags: ["experiencia", "facial"], text: "Ponerte en manos de Estefanía es garantía de éxito. Es una profesional muy perfeccionista; su asesoramiento, trato y amabilidad diferencian su trabajo.", a: "C" },
    { name: "Judith Barrios Gómez", service: "Centro de estética", date: "Hace 3 semanas", tags: ["facial", "experiencia"], text: "Estoy encantada con este centro de estética. Desde la primera visita me hizo sentir súper cómoda y muy bien atendida.", a: "J" },
    { name: "Débora Gómez Romero", service: "Manos y pies", date: "Hace 4 semanas", tags: ["unas", "pies"], text: "No solo hizo su arte en mis manos, que como siempre es espectacular; también sanó unos pies que llevaban mucho encima.", a: "D" },
    { name: "Maribel Rabadan", service: "Trato cercano", date: "Hace un mes", tags: ["experiencia"], text: "Estefania es una buenísima profesional, con mucho interés en su profesión. Siempre está contenta; se ve que es feliz con lo que hace.", a: "M" },
    { name: "Natalia Abanades", service: "Limpieza facial", date: "Hace un mes", tags: ["facial"], text: "La limpieza facial ha sido espectacular. Mi piel ha quedado con una luz increíble, súper fresca y mucho más uniforme. Noté el resultado al instante.", a: "N" },
    { name: "Sabrina Calleja", service: "Manicura", date: "Hace un año", tags: ["unas"], text: "Llevo haciéndome las uñas 20 años. Estefania es la manicurista más profesional que he tenido. Mis uñas están preciosas y duran 6 semanas perfectamente.", a: "S" },
    { name: "Lau GasCar", service: "Experiencia", date: "Hace 2 años", tags: ["experiencia"], text: "Mi experiencia con Estefanía es espectacular siempre, así como de espectacular es ella.", a: "L" },
    { name: "Paula Lapeña Gonzalez", service: "Uñas y asesoramiento", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Súper satisfecha con mi experiencia. Es muy profesional, el sitio es acogedor y aconseja lo mejor para el cuidado de tus uñas.", a: "P" },
    { name: "Judit GG", service: "Diseños de uñas", date: "Hace 2 años", tags: ["unas"], text: "Más de cuatro años llevo a su lado haciéndome las uñas. Siempre crea los diseños perfectos y te deja las uñas perfectísimas.", a: "J" },
    { name: "Rebeca Lorente Martínez", service: "Durabilidad", date: "Hace 2 años", tags: ["unas"], text: "Son 7 años haciéndome las uñas con ella y la calidad es inmejorable. Jamás se me ha partido o caído una uña. Siempre innovando.", a: "R" },
    { name: "Déborah García Plaza", service: "Puntualidad y calidad", date: "Hace un año", tags: ["unas", "experiencia"], text: "La mejor de Cuenca: buen precio, calidad y duración. No te hace esperar; es muy puntual y organizada con los tiempos.", a: "D" },
    { name: "Beatriz Murcia Collado", service: "Uñas sanas", date: "Hace 2 años", tags: ["unas"], text: "Elegir a Estefanía para el cuidado de tus uñas es un acierto. Nunca he tenido mis uñas tan bonitas y sanas.", a: "B" },
    { name: "Cristina Castellanos", service: "Duración y horarios", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Gran profesional. Las uñas duran muchísimo y lo más importante: respeta mucho los horarios. Calidad-precio, la mejor.", a: "C" },
    { name: "Ikigai Bienestar", service: "Uñas sanas", date: "Hace 2 años", tags: ["unas"], text: "Desde hace 3 años mis uñas cuidadas y bonitas gracias a Estefanía, con la seguridad de que están sanas. Adapta el diseño a mis gustos.", a: "I" },
    { name: "Sheyla Villarreal", service: "Terminación de uña", date: "Hace 2 años", tags: ["unas"], text: "Es una auténtica profesional. Una calidad buenísima y un terminado de uña perfecto.", a: "S" },
    { name: "Amalia Avram", service: "Diseños exactos", date: "Hace un año", tags: ["unas"], text: "En mi vida he tenido las uñas tan perfectas e impecables. Duran un montón y te hace los diseños tal cual.", a: "A" },
    { name: "Sonia Del Hoyo", service: "Uñas bonitas", date: "Hace 2 años", tags: ["unas"], text: "Desde que me hizo las uñas por primera vez, tengo las uñas bonitas. Gracias a ella, mis uñas me encantan.", a: "S" },
    { name: "Silvia Silvia", service: "Detalle y elegancia", date: "Hace 2 años", tags: ["unas"], text: "Si buscas unas uñas que te identifiquen, cuidadas hasta en el más mínimo detalle, este es el sitio idóneo.", a: "S" },
    { name: "Noemí De la Morena López", service: "Trato y manicura", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Llevo dos años haciéndome las uñas con Estefania y estoy encantada: uñas muy bien hechas y trato buenísimo.", a: "N" },
    { name: "María MePo", service: "Uñas perfectas", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Magnífica persona y profesional. Salgo siempre encantada por el trato y por mis uñas perfectas.", a: "M" },
    { name: "Leticia Guadalajara Pérez", service: "Uñas y trato", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Encantada con los resultados cada vez que voy. Estefania es una gran profesional y muy agradable.", a: "L" },
    { name: "Explora Cuenca", service: "Cuidado de uñas", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Trato y profesionalidad excelentes. Hace años que Estefanía cuida mis uñas y sigo encantada. Recomendable 100%.", a: "E" },
    { name: "Laura Aparicio Puerta", service: "Diseño personalizado", date: "Hace 2 años", tags: ["unas"], text: "Siempre consigue mejorar tus ideas y hacer que te encante su trabajo. Sabe plasmar tus gustos y jamás se equivoca.", a: "L" },
    { name: "Elena Viana", service: "Tendencias y calidad", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Excepcional. Profesionalidad, calidad y trato. Está a la última en tendencias y productos. Llevo siete años con ella.", a: "E" },
    { name: "Purificación Blanco", service: "Resultado y cercanía", date: "Hace 9 meses", tags: ["experiencia"], text: "Muy satisfecha con el resultado, mucha profesionalidad y cercanía.", a: "P" },
    { name: "Feli Cuenca", service: "Duración", date: "Hace 2 años", tags: ["unas"], text: "Llegué a hacerme las uñas después de un mes y siete días con todas enteritas, ni una partida. Contentísima.", a: "F" },
    { name: "Lorena Del Cubo", service: "Fidelidad", date: "Hace 2 años", tags: ["experiencia"], text: "Trabajo magnífico y maravillosa persona. Llevo muchísimos años con Estefania y así seguiré.", a: "L" },
    { name: "Alina Baciu", service: "Confianza", date: "Hace 11 meses", tags: ["experiencia"], text: "Súper satisfecha con el trabajo que hace y lo profesional que es. El sitio es acogedor y transmite mucha confianza.", a: "A" },
    { name: "María Teresa", service: "Arte en uñas", date: "Hace un año", tags: ["unas"], text: "Excelente profesional. Una artista de las uñas con todas las letras. Encantadísima siempre con su trabajo.", a: "M" },
    { name: "Sandra Molinero", service: "Trabajos impecables", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Excelente profesional. Trabajos impecables. Llevo más de 5 años con ella y no cambio.", a: "S" },
    { name: "Teresa Tejeda", service: "Clienta fiel", date: "Hace un año", tags: ["experiencia", "unas"], text: "Son muchos años desde que empecé con ella y no puedo estar más satisfecha con su trabajo. Para mí, la mejor.", a: "T" },
    { name: "Patricia SJB", service: "Trato humano", date: "Hace 2 años", tags: ["experiencia"], text: "Persona 10 en todos los sentidos. Verdadera profesional y maravillosa persona, siempre sacando una sonrisa.", a: "P" },
    { name: "Alicia Ruiz", service: "Arte en uñas", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Una profesional de los pies a la cabeza, hace arte en las uñas y además es una persona maravillosa.", a: "A" },
    { name: "Alexia Pardo", service: "Experiencia", date: "Hace un año", tags: ["experiencia"], text: "Muy satisfecha con mi experiencia. Estoy con ella desde hace mucho tiempo y es una gran profesional.", a: "A" },
    { name: "Belén Torralba Plaza", service: "Manicura", date: "Hace 2 años", tags: ["unas"], text: "Llevo varios años haciéndome la manicura con Estefania. Es magnífica y encantadora. Se supera con cada diseño.", a: "B" },
    { name: "Lucía Abad Ayora", service: "Experiencia", date: "Hace 2 años", tags: ["experiencia"], text: "Me encanta cómo lo hace y cada día que voy me gusta más.", a: "L" },
    { name: "Teresa Fuentes", service: "Uñas perfectas", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Excelente trato y profesionalidad en su trabajo. Uñas perfectas. 100% recomendable.", a: "T" },
    { name: "Ana Cepas Muñoz", service: "Uñas en Cuenca", date: "Hace 2 años", tags: ["unas"], text: "Aparte de hacer las mejores uñas de Cuenca, ella en sí es estupenda. Vuelvo siempre.", a: "A" },
    { name: "Elena Silvestre", service: "Fidelidad", date: "Hace 2 años", tags: ["experiencia"], text: "Una auténtica profesional. Llevo 8 años en sus manos y como persona es inmejorable.", a: "E" },
    { name: "Sonia Langreo Escudero", service: "Profesionalidad", date: "Hace un año", tags: ["experiencia"], text: "Llevo muchos años con ella y es muy buena. Profesional y simpática.", a: "S" },
    { name: "Diana Panadero Alvarez", service: "Uñas y cercanía", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Dos años con Estefanía y nunca defrauda. Además de hacer unas bonitas uñas, te sientes en casa.", a: "D" },
    { name: "Virginia Valenciano Saiz", service: "Uñas rápidas", date: "Hace un año", tags: ["unas"], text: "Manicurista maravillosa. Llevo años con ella y hace un trabajo excelente y en una hora.", a: "V" },
    { name: "Mónica López Ortiz", service: "Puntualidad y producto", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "De 10 como siempre. Puntual, trabajo excelente, calidad en los productos y unas uñas preciosas.", a: "M" },
    { name: "Alexandra Vilcan", service: "Uñas", date: "Hace 2 años", tags: ["unas"], text: "Llevo años haciéndome las uñas con ella y estoy muy encantada.", a: "A" },
    { name: "Bea Langreo", service: "Experiencia", date: "Hace un año", tags: ["experiencia"], text: "Es mi segunda vez con Estefanía y la verdad que volveré. Un placer.", a: "B" },
    { name: "Jenifer Rodriguez", service: "Uñas en Cuenca", date: "Hace un año", tags: ["unas"], text: "El mejor sitio de uñas en Cuenca. Llevo años haciéndome las uñas con ella y no la cambio por nada.", a: "J" },
    { name: "Rocio De las Heras Sanchez", service: "Uñas acrílicas", date: "Hace un año", tags: ["unas"], text: "Uñas acrílicas muy bien hechas, con muchísima variedad de colores y diseños muy bonitos y detallados.", a: "R" },
    { name: "Adriana Castellanos", service: "Manicura", date: "Hace un año", tags: ["unas", "experiencia"], text: "La mejor manicurista que hay. Increíble su trabajo y su trato. 100% recomendada.", a: "A" },
    { name: "Virginia Hernansaiz Arguisuelas", service: "Rapidez y trato", date: "Hace 2 años", tags: ["experiencia"], text: "Una profesional de los pies a la cabeza. Además de su rapidez y trato. Encantada siempre con los resultados.", a: "V" },
    { name: "Natalia Vindel", service: "Servicio y resultado", date: "Hace 2 años", tags: ["experiencia"], text: "Gran profesional; atención, servicio y resultado inmejorable. No hay otra mejor. Recomendable al 100%.", a: "N" },
    { name: "Paula Mora", service: "Adaptación a gustos", date: "Hace un año", tags: ["unas", "experiencia"], text: "Una experiencia increíble, siempre con una gran adaptación a tus gustos. Da gusto encontrar a alguien tan profesional.", a: "P" },
    { name: "Carmen Dominguez", service: "Cuidado de manos", date: "Hace 2 años", tags: ["unas"], text: "Donde mejor y con más cariño te cuida de tus manos. Muy recomendable y muy profesional.", a: "C" },
    { name: "Coral Valverde Templado", service: "Uñas perfectas", date: "Hace 2 años", tags: ["unas", "experiencia"], text: "Una auténtica profesional en mayúsculas. Nunca he llevado las uñas tan perfectas y el trato es exquisito.", a: "C" },
    { name: "Cristina Plaza", service: "Resultado", date: "Hace un año", tags: ["experiencia"], text: "Trabajo espectacular. Muy profesional y amable. Encantada.", a: "C" },
    { name: "Veronica Jimenez", service: "Uñas de ensueño", date: "Hace un año", tags: ["unas"], text: "La mejor para hacerse uñas. Gracias a ella tengo unas uñas de ensueño.", a: "V" },
    { name: "Nerea Fernández", service: "Uñas", date: "Hace un año", tags: ["unas"], text: "Es la mejor haciendo uñas y un amor.", a: "N" },
    { name: "Raquel Oliver", service: "Trato agradable", date: "Hace 2 años", tags: ["experiencia"], text: "Profesional, hace genial su trabajo y además es muy agradable.", a: "R" },
    { name: "Antonio Baciu", service: "Uñas", date: "Hace un año", tags: ["unas"], text: "Muy buen servicio y las uñas chulísimas.", a: "A" },
    { name: "Verónica Ventura", service: "Cercanía", date: "Hace 2 años", tags: ["experiencia"], text: "Muy profesional, cercana y amable. Recomiendo totalmente. Es un 10.", a: "V" },
    { name: "Patricia Martinez Portero", service: "Manicura", date: "Hace 2 años", tags: ["unas"], text: "El mejor sitio de Cuenca para tener una manicura perfecta.", a: "P" },
    { name: "Irene Navarro Palencia", service: "Cercanía", date: "Hace 2 años", tags: ["experiencia"], text: "Es profesional y muy cercana con los clientes. Sin duda, la mejor.", a: "I" },
    { name: "Brujillaratona Niña", service: "Experiencia", date: "Hace un año", tags: ["experiencia"], text: "Donde la vida te la hace más fácil. Gracias por tanto.", a: "B" },
    { name: "Lucía Torrijos Laín", service: "Renovación", date: "Hace un año", tags: ["experiencia"], text: "Muy profesional y renovándose continuamente.", a: "L" },
    { name: "Julia Pontones", service: "Servicio", date: "Hace 2 años", tags: ["experiencia"], text: "Muy buen servicio y Estefanía muy maja.", a: "J" },
    { name: "Luz María Carrasco Castro", service: "Experiencia", date: "Hace un año", tags: ["experiencia"], text: "Eres la mejor, en todos los sentidos.", a: "L" },
  ];

  const filters = [
  { id: "all", label: "Todas" },
  { id: "unas", label: "Uñas" },
  { id: "micro", label: "Micropigmentación" },
  { id: "facial", label: "Facial" },
  { id: "experiencia", label: "Trato" }];

  const poolFor = (id) => id === "all" ? reviews.filter((r) => r.text.length > 90) : reviews.filter((r) => r.tags.includes(id));
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const pool = poolFor(filter);
  const i = idx % pool.length;
  const cur = pool[i];
  useEffect(() => {
    if (paused || FX.reduce()) return;
    const t = setTimeout(() => setIdx((v) => (v + 1) % pool.length), 7000);
    return () => clearTimeout(t);
  }, [idx, paused, filter, pool.length]);

  const short = reviews.filter((r) => r.text.length >= 40 && r.text.length < 150);
  const rowA = short.filter((_, k) => k % 2 === 0).slice(0, 12);
  const rowB = short.filter((_, k) => k % 2 === 1).slice(0, 12);
  const card = (r, k, hidden) =>
  <figure className="rv-card" key={k} aria-hidden={hidden ? "true" : undefined}>
      <div className="rv-stars" aria-hidden="true">★★★★★</div>
      <blockquote>{r.text}</blockquote>
      <figcaption><span className="avatar">{r.a}</span><span>{r.name}<em>{r.service}</em></span></figcaption>
    </figure>;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section className="sec-testimonials" id="testimonios">
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Reseñas verificadas en Google</span>
        </R>

        <div className="testimonials-head">
          <h2 className="h-section">
            <LineMask>Lo que dicen</LineMask>
            <LineMask delay={120}>en <em style={{ fontFamily: "var(--serif)" }}>Cuenca</em>.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Opiniones reales de clientas en Google. Elige un servicio para leer
            las que hablan de él.
          </R>
        </div>

        <div className="rv-feature" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <div className="rv-filters" role="group" aria-label="Filtrar reseñas por servicio">
            {filters.map((f) =>
            <button key={f.id} type="button" className={`rv-filter ${filter === f.id ? "is-active" : ""}`}
            aria-pressed={filter === f.id} onClick={() => {setFilter(f.id);setIdx(0);}}>
                {f.label}<span>{poolFor(f.id).length}</span>
              </button>
            )}
          </div>

          <div className="rv-quote" key={`${filter}-${i}`}>
            <span className="rv-mark" aria-hidden="true">“</span>
            <blockquote>{cur.text}</blockquote>
            <div className="rv-meta">
              <span className="rv-name">{cur.name}</span>
              <span>{cur.service}</span>
              <span>{cur.date}</span>
            </div>
          </div>

          <div className="rv-controls">
            <button type="button" className="rv-nav" aria-label="Reseña anterior" onClick={() => setIdx((v) => (v - 1 + pool.length) % pool.length)}>←</button>
            <span className="rv-count">{pad(i + 1)} <span>/ {pad(pool.length)}</span></span>
            <button type="button" className="rv-nav" aria-label="Reseña siguiente" onClick={() => setIdx((v) => (v + 1) % pool.length)}>→</button>
            <span className={`rv-timer ${paused ? "paused" : ""}`} key={`t-${filter}-${i}`} aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <div className="rv-marquee" aria-label="Más reseñas de Google">
        <div className="rv-row"><div className="rv-track">{rowA.map((r, k) => card(r, `a${k}`))}{rowA.map((r, k) => card(r, `ad${k}`, true))}</div></div>
        <div className="rv-row rev"><div className="rv-track">{rowB.map((r, k) => card(r, `b${k}`))}{rowB.map((r, k) => card(r, `bd${k}`, true))}</div></div>
      </div>

      <div className="container">
        <div className="testimonials-stats">
          <R as="div" className="stat">
            <span className="n"><Counter to={5} decimals={1} /><span style={{ fontSize: ".5em", color: "var(--muted)" }}>★</span></span>
            <span className="l">Valoración en Google</span>
          </R>
          <R as="div" className="stat" delay={100}>
            <span className="n"><Counter to={75} prefix="+" /></span>
            <span className="l">Reseñas reales en Google</span>
          </R>
          <R as="div" className="stat" delay={200}>
            <span className="n"><Counter to={reviews.length} /></span>
            <span className="l">Reseñas en esta página</span>
          </R>
          <R as="div" className="stat" delay={300}>
            <span className="n"><Counter to={7} prefix="+" /><span style={{ fontSize: ".5em", color: "var(--muted)" }}> años</span></span>
            <span className="l">De clientas fieles que repiten</span>
          </R>
        </div>

        <R as="div" className="reviews-cta" delay={120}>
          <span className="gstars">
            <span className="s">★★★★★</span> <b>5,0 en Google</b> · +75 reseñas
          </span>
          <a className="btn dark" href={BUSINESS.reviewsUrl} target="_blank" rel="noopener noreferrer">
            Leer todas las reseñas en Google <span className="arrow">→</span>
          </a>
        </R>
      </div>
    </section>);

}

/* ---------- Ornament (drift-on-scroll decoration) ---------- */
function Ornament({ children, style, speed = 0.1, tick = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      raf = 0;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={ref} className={`ornament ${tick ? "tick" : ""}`} style={style}>{children}</div>;
}

function LegalNoticeModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`legal-modal ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
      <div className="scrim" onClick={onClose}></div>
      <section className="legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <button className="legal-close" onClick={onClose} aria-label="Cerrar aviso legal y privacidad"></button>
        <h2 id="legal-title">Aviso legal y privacidad</h2>
        <p className="intro">
          Información breve, transparente y pensada para entender cómo se usa esta web y qué ocurre si contactas con el estudio.
        </p>

        <div className="legal-section">
          <h3>Responsable</h3>
          <p>
            Esta web pertenece a {BUSINESS.name}, estudio de belleza situado en {BUSINESS.addressLine}, {BUSINESS.postalCity}, {BUSINESS.country}. Puedes contactar en{" "}
            <a className="linkish" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
          </p>
        </div>

        <div className="legal-section">
          <h3>Finalidad</h3>
          <p>
            Los datos que envíes por email, WhatsApp o redes sociales se usan únicamente para responder a tu consulta, gestionar una cita o darte información sobre los servicios solicitados.
          </p>
        </div>

        <div className="legal-section">
          <h3>Privacidad</h3>
          <ul>
            <li>No se venden tus datos ni se ceden a terceros con fines comerciales.</li>
            <li>Los datos se conservan el tiempo necesario para atender la consulta o la relación profesional.</li>
            <li>Puedes solicitar acceso, rectificación, supresión, oposición o limitación escribiendo al correo indicado.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h3>Servicios externos</h3>
          <p>
            La web carga tipografías, mapa y enlaces externos como Instagram o WhatsApp. Al abrir esos servicios se aplican sus propias condiciones y políticas de privacidad.
          </p>
        </div>

        <div className="legal-section">
          <h3>Cookies</h3>
          <p>
            Esta web no instala cookies propias de analítica o publicidad. Los servicios externos integrados o enlazados pueden realizar conexiones técnicas necesarias para mostrarse correctamente.
          </p>
        </div>

        <p className="legal-note">
          Texto informativo de primera capa inspirado en el criterio de claridad y transparencia del RGPD y la LSSI-CE. Conviene validarlo con asesoría si se añaden formularios, pagos, analítica o campañas.
        </p>
      </section>
    </div>
  );
}

/* ---------- Footer ---------- */
function FooterSection() {
  const [legalOpen, setLegalOpen] = useState(false);
  const ref = useProgress("through");
  const mapsEmbed = "https://www.openstreetmap.org/export/embed.html?bbox=-2.148%2C40.060%2C-2.122%2C40.074&layer=mapnik&marker=40.0657%2C-2.1357";
  const mapsLink  = BUSINESS.mapsShort;

  const waMsg = CITA_MSG;

  const Ig = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/>
    </svg>
  );
  const Wa = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.6-4.6A9 9 0 1 1 8 20.4L3 21z"/>
      <path d="M8.5 9c.2 1 .9 2.4 2 3.5s2.5 1.8 3.5 2c.4 0 .9-.1 1.2-.5l.6-.8a.8.8 0 0 0-.2-1.1l-1.3-.8a.8.8 0 0 0-1 .2l-.3.4c-.7-.3-1.4-.7-1.9-1.2s-.9-1.2-1.2-1.9l.4-.3a.8.8 0 0 0 .2-1l-.8-1.3a.8.8 0 0 0-1.1-.2L8 6.6c-.4.3-.5.8-.5 1.2 0 .4.4.8 1 1.2z"/>
    </svg>
  );

  const socials = [
    { ic: Wa, label: "WhatsApp",   sub: `Pedir cita ahora · ${BUSINESS.city}`,  href: wa(waMsg) },
    { ic: Ig, label: "Instagram",  sub: BUSINESS.instagramHandle,                href: BUSINESS.instagramUrl },
  ];

  return (
    <footer className="footer" id="contacto" ref={ref}>
      <div className="container">
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Contacto · Cómo llegar</span>
        </R>

        <div className="footer-head">
          <R as="h2">
            <LineMask>Ven a vernos.</LineMask>
          </R>
          <R className="body" delay={150} style={{ maxWidth: "44ch" }}>
            Estamos en el Centro Comercial 4 Caminos, a pocos pasos de la Plaza de la
            Hispanidad. Escríbeme por WhatsApp y buscamos un hueco que te venga bien.
          </R>
          <a className="footer-cta" href={wa(CITA_MSG)} target="_blank" rel="noopener">
            <span className="sr-only">Pedir cita por WhatsApp</span>
            <CircleText id="ct-footer" text="Pedir cita · WhatsApp · Pedir cita · WhatsApp · " />
            <span className="core" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="footer-layout">
          {/* MAP */}
          <div className="footer-map-wrap">
            <iframe
              className="footer-map"
              src={mapsEmbed}
              title={`Ubicación del estudio · ${BUSINESS.addressLine}, ${BUSINESS.city}`}
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen></iframe>
            <a className="footer-map-pin" href={mapsLink} target="_blank" rel="noopener" aria-label="Abrir en Google Maps">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/>
                <circle cx="12" cy="10" r="2.5"/>
              </svg>
              <span>Abrir en Google Maps</span>
            </a>
          </div>

          {/* INFO */}
          <div className="footer-info">
            <R as="div" className="info-row">
              <div className="label">Ubicación · {BUSINESS.addressTag}</div>
              <div className="val">{BUSINESS.addressShort}<br/>{BUSINESS.postalCity} · {BUSINESS.country}</div>
              <div className="note">{BUSINESS.landmark}</div>
            </R>

            <R as="div" className="info-row" delay={80}>
              <div className="label">Horario</div>
              <div className="val">Lunes a viernes · 9:00 – 21:00</div>
              <div className="note">Solo con cita previa, para atenderte sin esperas.</div>
            </R>

            <R as="div" className="info-row" delay={160}>
              <div className="label">Teléfono y correo</div>
              <a className="linkish" href={`tel:+${BUSINESS.phone}`}>+34 690 699 205</a>
              <div className="note" style={{ marginTop: 6 }}>
                <a className="linkish" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </div>
            </R>

            <R as="div" className="info-row" delay={240}>
              <div className="label">Reserva tu hora</div>
              <a className="linkish" href={wa(waMsg)} target="_blank" rel="noopener">
                Pedir cita por WhatsApp →
              </a>
            </R>
          </div>
        </div>

        {/* SOCIAL TILES — WhatsApp / Instagram */}
        <div className="social-grid">
          {socials.map((s, i) => (
            <R as="a" key={s.label} v="r-fade" delay={i * 80}
               className="social-tile"
               href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined}
               rel="noopener" aria-label={s.label}>
              <span className="ic">{s.ic}</span>
              <span className="meta">
                <span className="t">{s.label}</span>
                <span className="h">{s.sub}</span>
              </span>
              <span className="arrow">→</span>
            </R>
          ))}
        </div>

        {/* Signature */}
        <div className="footer-signature">
          <img className="footer-logo-img on-dark" src={BRAND_ASSETS.logoBlack} alt={BUSINESS.name} width="192" height="192" loading="lazy" />
          <div className="tag">Belleza de autor · {BUSINESS.city} · {BUSINESS.addressTag}</div>
        </div>

        <div className="bottom">
          <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
          <span>El arte de sentirte bien · {BUSINESS.city}</span>
          <button className="legal-trigger" onClick={() => setLegalOpen(true)}>Aviso legal · Privacidad</button>
        </div>

        <div className="dev-credit">
          Desarrollado por{" "}
          <a href="https://natanaelalzatetorres.com/" target="_blank" rel="noopener" className="dev-link">
            Nathan Torres
          </a>
        </div>
      </div>
      <LegalNoticeModal open={legalOpen} onClose={() => setLegalOpen(false)} />
    </footer>);

}

/* ---------- FAQ ---------- */
function FaqSection() {
  const faqs = [
  {
    q: "¿En qué consiste el masaje en pareja?",
    a: "Es un ritual dúo en el que dos personas reciben un masaje relajante a la vez, en la misma cabina, con aromaterapia y un ambiente cálido pensado para compartir un momento de calma."
  },
  {
    q: "¿Cuánto dura la micropigmentación de cejas, labios u ojos?",
    a: "El resultado se mantiene de forma natural entre 12 y 24 meses, según tu tipo de piel, el cuidado diario y la exposición solar. Incluimos una sesión de retoque de asentamiento para consolidar un acabado impecable."
  },
  {
    q: "¿Cómo es el proceso de cicatrización?",
    a: "La primera semana el color se ve más intenso por la oxidación natural; en la segunda se forma una microcostra que se desprende sola; hacia la tercera la piel se renueva y el pigmento vuelve a la superficie; en la cuarta realizamos el retoque final."
  },
  {
    q: "¿Qué medidas de higiene y seguridad seguís?",
    a: "Trabajamos con asepsia de grado clínico conforme al Decreto 5/2004 de la JCCM, pigmentos registrados en la AEMPS, agujas monodosis de un solo uso y certificación sanitaria oficial."
  },
  {
    q: "¿Cuánto duran las uñas?",
    a: "Con nivelación y rubber base suelen durar más de 3 semanas, según lo rápido que te crezcan y cómo las cuides. Es una manicura de precisión: se trabaja la cutícula con detalle para que el esmalte empiece justo en el borde de la piel."
  },
  {
    q: "¿Dónde estáis y cómo pido cita?",
    a: `Estamos en ${BUSINESS.addressShort}, ${BUSINESS.postalCity}. ${BUSINESS.landmark} Atendemos con cita previa de lunes a viernes de 9:00 a 21:00; la forma más rápida de reservar es por WhatsApp.`
  }];

  return (
    <section className="sec-faq" id="faq">
      <div className="container">
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Preguntas frecuentes</span>
        </R>
        <div className="faq-grid">
          <div className="faq-head">
            <h2 className="h-section">
              <LineMask>Antes de tu</LineMask>
              <LineMask delay={120}>primera <em style={{ fontFamily: "var(--serif)" }}>cita</em>.</LineMask>
            </h2>
            <R className="body" delay={200} style={{ marginTop: 24 }}>
              Resolvemos las dudas más habituales antes de tu primera cita. Si te queda
              alguna pregunta, escríbenos por WhatsApp y te respondemos personalmente.
            </R>
            <R delay={300} style={{ marginTop: 28 }}>
              <a className="btn dark" href={wa("Hola Stefania, tengo una duda antes de reservar cita. ¿Me puedes ayudar?")} target="_blank" rel="noopener">
                Preguntar por WhatsApp <span className="arrow">→</span>
              </a>
            </R>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) =>
            <R as="details" className="faq-item" key={i} v="r-fade" delay={i * 70}>
                <summary>
                  <span className="faq-q">{f.q}</span>
                  <span className="faq-ic" aria-hidden="true"></span>
                </summary>
                <p className="faq-a">{f.a}</p>
              </R>
            )}
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Floating WhatsApp button (mobile) ---------- */
function WhatsAppFab() {
  const msg = CITA_MSG;
  return (
    <a className="wa-fab" href={wa(msg)} target="_blank" rel="noopener" aria-label="Pedir cita por WhatsApp">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21l1.6-4.6A9 9 0 1 1 8 20.4L3 21z" />
        <path d="M8.5 9c.2 1 .9 2.4 2 3.5s2.5 1.8 3.5 2c.4 0 .9-.1 1.2-.5l.6-.8a.8.8 0 0 0-.2-1.1l-1.3-.8a.8.8 0 0 0-1 .2l-.3.4c-.7-.3-1.4-.7-1.9-1.2s-.9-1.2-1.2-1.9l.4-.3a.8.8 0 0 0 .2-1l-.8-1.3a.8.8 0 0 0-1.1-.2L8 6.6c-.4.3-.5.8-.5 1.2 0 .4.4.8 1 1.2z" />
      </svg>
      <span className="wa-fab-label">Pedir cita</span>
    </a>);

}

/* ---------- App ---------- */
function App() {
  useScrollProgress();
  useEffect(() => {FX.init();}, []);
  return (
    <React.Fragment>
      <Cursor />
      <Nav />
      <main id="contenido">
        <Hero />
        <Marquee />
        <QuickServices />
        <Interlude id="interlude-1"
        src={SITE_IMAGES.nailDetail}
        placeholder="Detalle de una manicura hecha en el estudio"
        label="Uñas"
        quote={<>Uñas bonitas, sobre una <em style={{ fontFamily: "var(--serif)" }}>uña sana</em>.</>} />
        <NailsSection />
        <MassageSection />
        <FacialSection />
        <BodySection />
        <Interlude id="interlude-2"
        src={SITE_IMAGES.pigmentDetail}
        placeholder="Pigmentos y material de micropigmentación en el estudio"
        label="Micropigmentación"
        quote={<>Cada trazo se decide <em style={{ fontFamily: "var(--serif)" }}>antes de tocar la piel</em>.</>} />
        <MicroSection />
        <TestimonialsSection />
        <TrackSection />
        <FaqSection />
      </main>
      <FooterSection />
      <WhatsAppFab />
    </React.Fragment>);

}

globalThis.__STEFANIA_APP__ = App;
if (typeof document !== "undefined" && !globalThis.__PRERENDER__) {
  const rootEl = document.getElementById("root");
  if (rootEl.firstElementChild) ReactDOM.hydrateRoot(rootEl, <App />);
  else ReactDOM.createRoot(rootEl).render(<App />);
}
