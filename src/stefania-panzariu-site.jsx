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
  logoBlack: "assets/brand/stefania-panzariu-logo-black.png",
  logoWhite: "assets/brand/stefania-panzariu-logo-white.png",
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
};

const wa = (msg) => `https://wa.me/${BUSINESS.phone}?text=${encodeURIComponent(msg)}`;

// Mensaje estándar de cita (incluye la dirección centralizada).
const CITA_MSG = `Hola Stefania, me gustaría pedir cita en el estudio (${BUSINESS.addressLine}, ${BUSINESS.city}). ¿Me indicas tu disponibilidad?`;

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

function useSitePreloader() {
  useEffect(() => {
    const startedAt = performance.now();
    const minDuration = 500;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, minDuration - (performance.now() - startedAt));
      window.setTimeout(() => {
        document.body.classList.add("site-ready");
        document.body.classList.remove("is-loading");
        window.setTimeout(() => {
          document.getElementById("site-preloader")?.remove();
        }, 900);
      }, wait);
    };

    const fallback = window.setTimeout(finish, 3200);
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("load", finish);
    };
  }, []);
}

/* ---------- Reveal hook ---------- */
function useReveal(opts = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            if (opts.once !== false) io.unobserve(el);
          } else if (opts.once === false) {
            el.classList.remove("in");
          }
        });
      },
      { threshold: opts.threshold ?? 0.18, rootMargin: opts.rootMargin ?? "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function R({ as = "div", v = "r-fade", delay = 0, children, className = "", style, ...rest }) {
  const ref = useReveal();
  const Tag = as;
  const s = { ...(style || {}), transitionDelay: `${delay}ms` };
  return (
    <Tag ref={ref} className={`${v} ${className}`} style={s} {...rest}>
      {children}
    </Tag>);

}

/* line-by-line reveal — every line in own .line-mask span */
function LineMask({ children, delay = 0 }) {
  const ref = useReveal();
  return (
    <span ref={ref} className="line-mask" style={{ transitionDelay: `${delay}ms` }}>
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

/* ---------- Interlude full-bleed band ---------- */
function Interlude({ id, src, placeholder, label, quote, side = "left" }) {
  const photoRef = useRef(null);
  useEffect(() => {
    const el = photoRef.current;if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * 0.22).toFixed(1)}px, 0)`;
      raf = 0;
    };
    const on = () => {if (!raf) raf = requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {window.removeEventListener("scroll", on);window.removeEventListener("resize", on);cancelAnimationFrame(raf);};
  }, []);
  return (
    <section className="interlude" aria-hidden="false">
      <div className="photo" ref={photoRef}>
        <img className="cover-img" src={src} alt={placeholder} loading="lazy" />
      </div>
      <div className="legend">
        <R v="r-fade" className="ital">{quote}</R>
        <R v="r-right" as="span">{label}</R>
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
  { href: "#micropigmentacion", label: "Micropigmentación", idx: "01" },
  { href: "#unas", label: "Uñas de Autor", idx: "02" },
  { href: "#estetica", label: "Estética Facial", idx: "03" },
  { href: "#corporal", label: "Armonía Corporal", idx: "04" },
  { href: "#testimonios", label: "Reseñas", idx: "05" },
  { href: "#trayectoria", label: "Trayectoria", idx: "06" },
  { href: "#faq", label: "Preguntas", idx: "07" },
  { href: "#contacto", label: "El Refugio", idx: "08" }];


  return (
    <div className={`drawer-overlay ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="scrim" onClick={onClose}></div>
      <aside className="drawer" role="dialog" aria-label="Menú">
        <div className="drawer-top">
          <span className="brand-mark">
            <img className="logo-img" src={BRAND_ASSETS.logoBlack} alt={BUSINESS.name} style={{ height: 40 }} />
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
            <div className="label">El Refugio</div>
            <div className="addr">{BUSINESS.addressLine}<br />{BUSINESS.postalCity}</div>
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
          <a className="btn dark" href={wa(CITA_MSG)} onClick={onClose}>
            Pedir Cita por WhatsApp <span className="arrow">→</span>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
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
      <header className={`nav ${visible ? "visible" : ""} ${scrolled ? "scrolled" : ""}`}>
        <a href="#top" className="brand-mark" aria-label={BUSINESS.name}>
          <img className="logo-img" src={BRAND_ASSETS.logoWhite} alt={BUSINESS.name} />
        </a>
        <nav className="nav-links">
          <a href="#micropigmentacion">Micropigmentación</a>
          <a href="#unas">Uñas de Autor</a>
          <a href="#estetica">Estética</a>
          <a href="#corporal">Corporal</a>
          <a href="#trayectoria">Trayectoria</a>
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

/* ---------- Hero ---------- */
function Hero() {
  const photoRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const y = window.scrollY;
      if (photoRef.current) photoRef.current.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0) scale(1.08)`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-text">
          <R v="r-fade" delay={0}>
            <div className="kicker">{BUSINESS.name} · {BUSINESS.tagline}</div>
          </R>

          <h1 className="display">
            <LineMask delay={150}>El arte</LineMask>
            <LineMask delay={350}>de sentirte</LineMask>
            <LineMask delay={550}><em style={{ fontFamily: "var(--display)", fontStyle: "normal" }}>bien.</em></LineMask>
          </h1>

          <R className="lead" delay={1050}>
            Diseño visagista hiperrealista, micropigmentación avanzada y rituales
            de manicura de alta precisión en un espacio íntimo concebido para tu calma en Cuenca.
          </R>

          <R delay={1250} style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <a className="btn dark" href={wa("Hola Stefania, he estado viendo la web de tu estudio y me gustaría solicitar una consulta de valoración gratuita para Micropigmentación.")}>
              Reservar Consulta <span className="arrow">→</span>
            </a>
            <a className="btn" href="#micropigmentacion">Conocer el método</a>
          </R>
        </div>

        <div className="hero-photo">
          <div className="inner" ref={photoRef} style={{ willChange: "transform" }}>
            <img
              className="cover-img"
              src={SITE_IMAGES.hero}
              alt="Stefania Panzariu, fundadora del estudio de belleza de autor en Cuenca, especialista en micropigmentación y uñas"
              style={{ objectPosition: "50% 20%" }}
              width="1062" height="1509"
              fetchPriority="high"
              loading="eager" />
          </div>
        </div>
      </div>

      <div className="hero-meta">
        <div><span className="num">— </span>{BUSINESS.city} · {BUSINESS.country}</div>
        <div>EST · {BUSINESS.area}</div>
        <div><span className="num">— </span>Belleza de autor</div>
      </div>

      <div className="scroll-cue">
        <span>Desliza</span>
        <span className="bar"></span>
      </div>
    </section>);

}

/* ---------- Pinned horizontal healing timeline ---------- */
function HealingPin() {
  const wrapRef = useRef(null);
  const railRef = useRef(null);
  const progRef = useRef(null);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current,rail = railRef.current,prog = progRef.current;
    if (!wrap || !rail) return;

    const update = () => {
      const r = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, Math.min(total, -r.top));
      const t = total > 0 ? scrolled / total : 0; // 0..1
      const trackable = rail.scrollWidth - window.innerWidth;
      rail.style.transform = `translate3d(${(-trackable * t).toFixed(1)}px, 0, 0)`;
      if (prog) prog.style.setProperty("--p", `${(t * 100).toFixed(1)}%`);
      setActive(Math.min(4, Math.max(1, Math.ceil(t * 4) || 1)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {window.removeEventListener("scroll", update);window.removeEventListener("resize", update);};
  }, []);

  const weeks = [
  { w: "01", t: "Intensidad y cuidado", h: "El color se observa más oscuro", d: "Debido al proceso de oxidación natural. Te acompañamos indicándote cómo hidratarlo y cuidarlo durante los primeros días." },
  { w: "02", t: "La fase escondida", h: "La piel genera una microcostra", d: "Se desprende de forma natural y hace que el color parezca desaparecer temporalmente. Forma parte del proceso." },
  { w: "03", t: "El retorno del tono", h: "La epidermis se repara", d: "La nueva piel se renueva por completo y el pigmento vuelve a subir a la superficie de manera natural y suave." },
  { w: "04", t: "Retoque de perfección", h: "Sesión de asentamiento final", d: "Consolidamos un resultado impecable que te acompañará de 12 a 24 meses con plena armonía." }];


  return (
    <div className="pin-section" ref={wrapRef}>
      <div className="pin-stage">
        <div className="pin-head">
          <R as="div">
            <div className="kicker" style={{ marginBottom: 12 }}>Módulo educativo</div>
            <h3 className="h-sub" style={{ maxWidth: "22ch" }}>El ciclo de tu piel, explicado con calma.</h3>
          </R>
          <R as="div" v="r-right" className="small-caps">Semana {String(active).padStart(2, "0")} / 04</R>
        </div>

        <div className="pin-rail" ref={railRef}>
          {weeks.map((w) =>
          <div className="card" key={w.w}>
              <div>
                <div className="w">{w.w}</div>
                <div className="t" style={{ marginTop: 24 }}>Semana {w.w}</div>
              </div>
              <div>
                <div className="h">{w.h}</div>
                <p className="d">{w.d}</p>
                <div style={{ marginTop: 16, fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--muted)" }}>{w.t}</div>
              </div>
            </div>
          )}
        </div>

        <div className="pin-progress" ref={progRef}>
          <span>01</span>
          <span className="track"></span>
          <span>04</span>
        </div>
      </div>
    </div>);

}

/* ---------- Micropigmentación ---------- */
function MicroSection() {
  const methods = [
  {
    n: "01",
    t: "Visagismo hiperrealista, pelo a pelo",
    d: "Estudiamos tu estructura ósea, la dirección natural de tu vello y la tonalidad de tu piel para recrear unas cejas con un realismo tridimensional absoluto. No iniciamos el tratamiento hasta que apruebes el boceto a lápiz."
  },
  {
    n: "02",
    t: "Labios de seda · Acuarela Lip Blush",
    d: "Devolvemos la definición perdida al contorno de tus labios y aportamos un tono saludable y jugoso con pigmentos orgánicos de última generación."
  },
  {
    n: "03",
    t: "Eyeliner degradado de alta precisión",
    d: "Una sombra sutil y elegante en el párpado que enmarca y despierta la mirada sin el efecto duro de un delineado convencional."
  }];

  return (
    <React.Fragment>
      <section className="sec-micro" id="micropigmentacion">
        <GhostNum>01</GhostNum>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <R className="chapter">
            <span className="rule"></span>
            <span className="small-caps">Micropigmentación</span>
          </R>

          <div className="grid-2 end">
            <h2 className="h-section">
              <LineMask>La armonía</LineMask>
              <LineMask delay={120}>que siempre</LineMask>
              <LineMask delay={240}>estuvo ahí.</LineMask>
            </h2>
            <R className="body" delay={200}>
              La micropigmentación no busca transformar tu rostro en algo que no eres;
              busca devolverle la simetría y la fuerza natural que el tiempo ha
              difuminado. Cada trazo es una obra de precisión artesanal diseñada
              en exclusiva para ti.
            </R>
          </div>

          <div className="methods-wrap">
            <div className="sticky-col">
              <R className="kicker" style={{ marginBottom: 16 }}>El método en cabina</R>
              <R as="h3" className="h-sub" delay={120} style={{ maxWidth: "16ch" }}>
                Tres lenguajes,<br />una misma <em style={{ fontFamily: "var(--serif)" }}>precisión</em>.
              </R>
              <R delay={240} style={{ marginTop: 28 }}>
                <p className="body" style={{ maxWidth: "32ch" }}>
                  Asepsia de grado clínico bajo Decreto 5/2004 JCCM.
                  Pigmentos AEMPS, agujas monodosis y certificación oficial sanitaria.
                </p>
              </R>
            </div>

            <div className="methods-list">
              {methods.map((m, i) =>
              <R as="div" key={m.n} className="row" v="r-left" delay={i * 100}>
                  <div className="n">{m.n}</div>
                  <div>
                    <h4>{m.t}</h4>
                    <p>{m.d}</p>
                  </div>
                </R>
              )}
            </div>
          </div>

          <R style={{ display: "flex", justifyContent: "center", marginTop: 120 }}>
            <a className="btn dark" href={wa("Hola Stefania, me gustaría recibir más información y solicitar una cita para Micropigmentación.")}>
              Solicitar estudio visagista <span className="arrow">→</span>
            </a>
          </R>
        </div>
      </section>

      <HealingPin />
    </React.Fragment>);

}

/* ---------- Nails ---------- */
function NailsSection() {
  return (
    <section className="sec-nails" id="unas">
      <GhostNum>02</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Uñas de Autor</span>
        </R>

        <div className="grid-2 end">
          <h2 className="h-section">
            <LineMask>La manicura</LineMask>
            <LineMask delay={120}>que <em style={{ fontFamily: "var(--serif)" }}>fortalece</em></LineMask>
            <LineMask delay={240}>desde la raíz.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Las uñas hermosas no son el resultado de ocultar imperfecciones bajo
            capas pesadas. Esculpimos la elegancia sobre la salud de tu uña natural.
          </R>
        </div>

        <div className="nails-stage">
          <div className="col-photos">
            <R v="r-mask" className="img">
              <Parallax speed={0.08} className="inner">
                <img className="cover-img" src={SITE_IMAGES.nailMilky} alt="Manicura rusa con acabado milky en Stefania Panzariu Studio" loading="lazy" />
              </Parallax>
            </R>
            <R v="r-mask" delay={140} className="img">
              <Parallax speed={0.12} className="inner">
                <img className="cover-img" src={SITE_IMAGES.nailNude} alt="Uñas nude translúcidas con acabado limpio y natural" loading="lazy" />
              </Parallax>
            </R>
          </div>

          <div className="col-text">
            <R className="kicker" style={{ marginBottom: 16 }}>Quiet Luxury</R>
            <R as="h3" className="h-sub" delay={120} style={{ maxWidth: "20ch" }}>
              Tonos lechosos, nudes translúcidos y acabados limpios que estilizan tus manos.
            </R>
            <div className="nails-features">
              <R as="div" className="feat" v="r-left">
                <div className="label">Técnica</div>
                <div>
                  <h4>Manicura rusa de alta precisión</h4>
                  <p>Retiramos mecánicamente la cutícula con tornos específicos, logrando un esmaltado impecable que nace bajo el pliegue de la piel.</p>
                </div>
              </R>
              <R as="div" className="feat" v="r-left" delay={120}>
                <div className="label">Refuerzo</div>
                <div>
                  <h4>Nivelación de matriz · Rubber Base</h4>
                  <p>Bases de primera calidad para corregir imperfecciones y fortalecer la placa natural, con durabilidad de más de 3 semanas.</p>
                </div>
              </R>
              <R as="div" className="feat" v="r-left" delay={240}>
                <div className="label">Estética</div>
                <div>
                  <h4>Milky &amp; soft neutrals</h4>
                  <p>Acabados limpios y atemporales que respetan la anatomía de la mano y se mantienen elegantes en cualquier contexto.</p>
                </div>
              </R>
            </div>

            <R delay={300} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola, quiero reservar una cita para manicura rusa con refuerzo de matriz.")}>
                Reservar mi ritual <span className="arrow">→</span>
              </a>
            </R>
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Facial ---------- */
function FacialSection() {
  return (
    <section className="sec-facial" id="estetica">
      <GhostNum>03</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Estética facial avanzada</span>
        </R>

        <div className="facial-grid">
          <div className="facial-photos">
            <R v="r-mask" className="p1">
              <Parallax speed={0.08} className="inner">
                <img className="cover-img" src={SITE_IMAGES.facialCabin} alt="Cabina de estética facial avanzada con luz cálida" loading="lazy" />
              </Parallax>
            </R>
            <R v="r-mask" delay={200} className="p2">
              <Parallax speed={0.14} className="inner">
                <img className="cover-img" src={SITE_IMAGES.pigmentDetail} alt="Detalle macro de la piel en un tratamiento de estética facial avanzada" loading="lazy" />
              </Parallax>
            </R>
          </div>

          <div>
            <h2 className="h-section" style={{ marginBottom: 28 }}>
              <LineMask>Cuidando tu piel</LineMask>
              <LineMask delay={120}>y tu alma.</LineMask>
            </h2>
            <R className="lead" delay={200}>
              Un ritual diseñado para silenciar el ruido exterior y devolver el
              resplandor natural a tu rostro. Un momento de pausa y reconexión profunda.
            </R>

            <div className="ritual-list">
              <R as="div" v="r-left" className="it">
                <div className="mark">✦</div>
                <div>
                  <h4>Brightening Action</h4>
                  <p>Tratamiento profesional despigmentante e iluminador que unifica el tono, reduce imperfecciones y aporta un efecto glow inmediato desde la primera sesión.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={120} className="it">
                <div className="mark">✦</div>
                <div>
                  <h4>Argi-Mask White · Arcilla blanca</h4>
                  <p>Ritual oxigenante que limpia en profundidad, equilibra la piel cansada y la deja increíblemente suave, fresca y luminosa.</p>
                </div>
              </R>
            </div>

            <R delay={280} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola Stefania, me gustaría reservar una sesión de Estética Facial Avanzada.")}>
                Regalarme un momento de calma <span className="arrow">→</span>
              </a>
            </R>
          </div>
        </div>
      </div>
    </section>);

}

/* ---------- Armonía Corporal ---------- */
function BodySection() {
  return (
    <section className="sec-body" id="corporal">
      <GhostNum>04</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Armonía Corporal</span>
        </R>

        <div className="body-grid">
          <div className="body-text">
            <h2 className="h-section" style={{ marginBottom: 28 }}>
              <LineMask>Reconectar con</LineMask>
              <LineMask delay={120}>tu <em style={{ fontFamily: "var(--serif)" }}>cuerpo</em>.</LineMask>
            </h2>
            <R className="lead" delay={200}>
              Rituales diseñados para reconectar con tu cuerpo, liberando tensión
              y realzando tu firmeza natural a través de terapias manuales y técnicas avanzadas.
            </R>

            <div className="ritual-list">
              <R as="div" v="r-left" className="it">
                <div className="mark">✦</div>
                <div>
                  <h4>Maderoterapia</h4>
                  <p>Técnica natural que moldea y tonifica la silueta mediante fricciones profundas con instrumentos de madera noble. Ayuda a reducir volumen, mejorar la circulación y combatir la celulitis.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={120} className="it">
                <div className="mark">✦</div>
                <div>
                  <h4>Drenaje Linfático</h4>
                  <p>Terapia manual suave y precisa que favorece la eliminación de toxinas. Ideal para aliviar la sensación de piernas cansadas, reducir la inflamación y tratar la retención de líquidos.</p>
                </div>
              </R>
              <R as="div" v="r-left" delay={240} className="it">
                <div className="mark">✦</div>
                <div>
                  <h4>Exfoliación y Envoltura</h4>
                  <p>Renovación celular profunda que elimina impurezas y devuelve la elasticidad a la piel. Un tratamiento intensivo que deja el cuerpo profundamente hidratado, firme y luminoso.</p>
                </div>
              </R>
            </div>

            <R delay={320} style={{ marginTop: 36 }}>
              <a className="btn dark" href={wa("Hola Stefania, me gustaría reservar una sesión de tratamiento corporal (Armonía Corporal).")}>
                Reservar mi ritual corporal <span className="arrow">→</span>
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

/* ---------- Trayectoria ---------- */
function TrackSection() {
  const wrapRef = useRef(null);
  const progRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;const prog = progRef.current;
    if (!wrap || !prog) return;
    const update = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = r.top - vh * 0.5;
      const end = r.top + r.height - vh * 0.5;
      const t = Math.max(0, Math.min(1, -start / (end - start)));
      prog.style.height = `${(t * 100).toFixed(1)}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {window.removeEventListener("scroll", update);window.removeEventListener("resize", update);};
  }, []);

  const steps = [
  {
    n: "01",
    t: "Perfección bajo presión",
    d: "Compitiendo a nivel nacional con los mejores talentos del maquillaje permanente en el campeonato The Beauty Experts (Valencia) para mantener nuestro estudio a la vanguardia absoluta.",
    tag: "El Reconocimiento",
    src: SITE_IMAGES.artistTool,
    alt: "Stefania Panzariu con su dermógrafo de micropigmentación en el estudio de Cuenca",
    pos: "50% 28%"
  },
  {
    n: "02",
    t: "Innovación sin fronteras",
    d: "Formación continua en el World PMU Congress 2026 a bordo del MSC Fantasia. Análisis de tendencias mundiales en técnicas de implantación de pigmentos hiperrealistas.",
    tag: "El Congreso Mundial",
    src: SITE_IMAGES.hero,
    alt: "Retrato de Stefania Panzariu, artista de micropigmentación y belleza de autor en Cuenca",
    pos: "50% 18%"
  },
  {
    n: "03",
    t: "Tu confianza es el destino",
    d: "Traer la excelencia internacional directamente al corazón de Cuenca, ofreciéndote un refugio donde la técnica se convierte en arte.",
    tag: "La Misión",
    src: SITE_IMAGES.facialCabin,
    alt: "Cabina del estudio Stefania Panzariu en Cuenca, un refugio íntimo de belleza",
    pos: "50% 50%"
  }];


  return (
    <section className="sec-track" id="trayectoria">
      <GhostNum>05</GhostNum>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule" style={{ background: "rgba(255,255,255,.5)" }}></span>
          <span className="small-caps">El cuaderno de la artista</span>
        </R>

        <div className="grid-2 end">
          <h2 className="h-section">
            <LineMask>La trayectoria</LineMask>
            <LineMask delay={120}>del autor.</LineMask>
          </h2>
          <R className="body" delay={200} style={{ color: "rgba(255,255,255,.72)" }}>
            Tres hitos que cuentan, sin atajos, cómo nace este estudio: del
            entrenamiento competitivo al congreso mundial, y de ahí a un rincón
            íntimo en el corazón de Cuenca.
          </R>
        </div>

        <div className="track-timeline" ref={wrapRef}>
          <div className="track-progress" ref={progRef}></div>
          {steps.map((s, i) =>
          <R as="div" key={s.n} className={`track-step ${i % 2 === 1 ? "right" : ""}`}>
              {i % 2 === 0 ?
            <React.Fragment>
                  <div className="img-wrap">
                    <Parallax speed={0.1} className="inner">
                      <img className="cover-img" src={s.src} alt={s.alt} style={{ objectPosition: s.pos }} loading="lazy" />
                    </Parallax>
                  </div>
                  <div className="dot"></div>
                  <div className="text">
                    <div className="n">{s.n}</div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </React.Fragment> :

            <React.Fragment>
                  <div className="text">
                    <div className="n">{s.n}</div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                  <div className="dot"></div>
                  <div className="img-wrap">
                    <Parallax speed={0.1} className="inner">
                      <img className="cover-img" src={s.src} alt={s.alt} style={{ objectPosition: s.pos }} loading="lazy" />
                    </Parallax>
                  </div>
                </React.Fragment>
            }
            </R>
          )}
        </div>
      </div>
    </section>);

}

/* ---------- Testimonials ---------- */
function TestimonialsSection() {
  // Reseñas reales verificadas en Google, organizadas por servicio.
  const groups = [
    {
      cat: "Uñas de autor y manicura",
      tone: "nails",
      cols: 3,
      items: [
        {
          q: "Llevo haciéndome las uñas 20 años y Estefanía es la manicurista más profesional que he tenido. Mis uñas están preciosas, duran 6 semanas perfectamente y ella es un ángel de persona. La recomiendo a todas mis amigas: nunca defrauda. Es un 10.",
          n: "Sabrina Calleja", svc: "Manicura · 20 años de clienta", a: "S", lg: true
        },
        {
          q: "Excelente profesional pero mejor persona. Son 7 años los que llevo haciéndome las uñas con ella y la calidad es inmejorable. Jamás se me ha partido o caído una uña. Siempre innovando en diseños nuevos. Calidad-precio perfecta.",
          n: "Rebeca Lorente", svc: "Uñas de autor · Durabilidad", a: "R"
        },
        {
          q: "Súper contenta con Estefanía, la recomiendo 100×100, la mejor de Cuenca: buen precio, calidad y duración. No te hace esperar como en otros sitios, es muy puntual y organizada con los tiempos. Y además, bellísima persona.",
          n: "Déborah García", svc: "Manicura · La mejor de Cuenca", a: "D"
        },
        {
          q: "El mejor sitio de uñas en Cuenca. Llevo años haciéndome las uñas con ella y no la cambio por nada.",
          n: "Jenifer Rodríguez", svc: "Uñas en Cuenca", a: "J"
        },
        {
          q: "Elegir a Estefanía para el cuidado de tus uñas es un acierto. Nunca he tenido mis uñas tan bonitas y sanas. Es una profesional muy perfeccionista, con un trato súper cercano y, algo a destacar, la puntualidad con sus citas.",
          n: "Beatriz Murcia", svc: "Manicura · Puntualidad", a: "B"
        },
        {
          q: "Trabajo espectacular. Muy profesional y amable. ¡Encantada!",
          n: "Cristina Plaza", svc: "Uñas de autor", a: "C", lg: true
        },
      ]
    },
    {
      cat: "Micropigmentación y maquillaje permanente",
      tone: "micro",
      cols: 3,
      items: [
        {
          q: "Me hice un sombreado de cejas y me quedaron espectaculares, ya que tenía un tatuaje por debajo. La verdad que ha sido todo un acierto, recomendado 100%. Y lo mejor: no duele casi nada.",
          n: "Mª Mercedes Felipe", svc: "Sombreado de cejas", a: "M"
        },
        {
          q: "Llevo tiempo visitando a Estefanía para las uñas y estoy encantada con su trabajo. Hoy le confié el maquillaje permanente, un tatuaje en los párpados. ¡Increíble! Es una verdadera profesional y una técnica muy talentosa.",
          n: "Eden Niknafs", svc: "Maquillaje permanente · Párpados", a: "E"
        },
        {
          q: "Resultados espectaculares. No puedo estar más feliz: el tratamiento facial dejó mi piel luminosa e hidratada, y la micropigmentación de labios quedó preciosa.",
          n: "María del Carmen", svc: "Micropigmentación de labios", a: "M"
        },
      ]
    },
    {
      cat: "Estética facial",
      tone: "facial",
      cols: 2,
      items: [
        {
          q: "He salido encantada con la limpieza facial. Desde que entras por la puerta te sientes como en casa: ambiente acogedor, trato cercano y muy profesional. Se nota el cariño y la dedicación en cada detalle. Mi piel quedó increíble.",
          n: "María I.", svc: "Limpieza facial", a: "M"
        },
        {
          q: "Cada vez que voy salgo más contenta, pero la limpieza facial de hoy ha sido espectacular. Mi piel ha quedado con una luz increíble, súper fresca y mucho más uniforme. Noté el resultado al instante.",
          n: "Natalia Abanades", svc: "Limpieza facial profunda", a: "N"
        },
        {
          q: "Como siempre, una experiencia maravillosa. Nunca deja de sorprenderme por su profesionalidad, dedicación y el cariño con el que realiza cada tratamiento. Esta vez me hice una limpieza facial con nuevos productos y he quedado encantada.",
          n: "Cecilia Gil", svc: "Estética facial", a: "C"
        },
        {
          q: "Estoy encantada con este centro de estética. Desde la primera visita me hizo sentir súper cómoda y muy bien atendida. El trato es increíble; se nota el cariño y la profesionalidad con la que trabaja.",
          n: "Judith Barrios", svc: "Centro de estética", a: "J"
        },
      ]
    },
    {
      cat: "Manos, pies y bienestar",
      tone: "body",
      cols: 2,
      items: [
        {
          q: "Ayer no sólo hizo su arte en mis manos, que como siempre es espectacular, sino que también sanó unos pies que llevaban mucho encima y salieron hechos una maravilla. Estefanía, más allá de una esteticista, es bálsamo.",
          n: "Débora Gómez", svc: "Manos y pies · Bienestar", a: "D"
        },
        {
          q: "Ponerte en manos de Estefanía es garantía de éxito. Es una profesional en todos los tratamientos que hace, muy perfeccionista; su asesoramiento, trato y amabilidad diferencian su trabajo. Es encantadora y una gran persona.",
          n: "Conchi Pérez", svc: "Todos los tratamientos", a: "C"
        },
      ]
    }
  ];

  const Star = () => (
    <svg viewBox="0 0 24 24"><path d="M12 2l2.95 6.97L22 10l-5.5 4.78L18.18 22 12 18.27 5.82 22l1.68-7.22L2 10l7.05-1.03L12 2z"/></svg>
  );

  const GoogleG = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.22-4.74 3.22-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );

  return (
    <section className="sec-testimonials" id="testimonios">
      <Ornament style={{ top: 60, right: -40 }} speed={0.05}>06</Ornament>
      <Ornament tick style={{ bottom: 60, left: -20 }} speed={-0.08}>“</Ornament>

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">Reseñas verificadas en Google</span>
        </R>

        <div className="testimonials-head">
          <h2 className="h-section">
            <LineMask>Lo que dicen</LineMask>
            <LineMask delay={120}>en <em style={{fontFamily:"var(--serif)"}}>Cuenca</em>.</LineMask>
          </h2>
          <R className="body" delay={200}>
            Más de 75 reseñas reales en Google, casi todas de clientas que repiten
            año tras año —algunas llevan más de 7 años en sus manos—. Estas son
            algunas voces, organizadas por servicio.
          </R>
        </div>

        {groups.map((g) => (
          <div className={`tg tg-${g.tone}`} key={g.cat}>
            <R as="div" className="tg-head">
              <span className="tg-rule"></span>
              <span className="small-caps">{g.cat}</span>
              <span className="tg-count">{g.items.length} {g.items.length === 1 ? "reseña" : "reseñas"}</span>
            </R>
            <div className={`testimonials-grid cols-${g.cols}`}>
              {g.items.map((t, i) => (
                <R as="div" key={i} className="quote" v="r-fade" delay={i * 120}>
                  <span className="gbadge" aria-label="Reseña de Google"><GoogleG/></span>
                  <div className="stars" aria-label="5 estrellas">
                    <Star/><Star/><Star/><Star/><Star/>
                  </div>
                  <blockquote>{t.q}</blockquote>
                  <div className="author">
                    <div className="avatar">{t.a}</div>
                    <div className="who">
                      <span className="name">{t.n}</span>
                      <span className="svc">{t.svc}{t.lg ? <span className="lg">Local Guide</span> : null}</span>
                    </div>
                  </div>
                </R>
              ))}
            </div>
          </div>
        ))}

        <div className="testimonials-stats">
          <R as="div" className="stat">
            <span className="n">5,0<span style={{ fontSize: ".5em", color: "var(--muted)" }}>★</span></span>
            <span className="l">Valoración en Google</span>
          </R>
          <R as="div" className="stat" delay={100}>
            <span className="n">+75</span>
            <span className="l">Reseñas reales verificadas</span>
          </R>
          <R as="div" className="stat" delay={200}>
            <span className="n">100%</span>
            <span className="l">Clientas que la recomiendan</span>
          </R>
          <R as="div" className="stat" delay={300}>
            <span className="n">+7<span style={{ fontSize: ".5em", color: "var(--muted)" }}> años</span></span>
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
    </section>
  );
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
    <div className={`legal-modal ${open ? "open" : ""}`} aria-hidden={!open}>
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
    <footer className="footer" id="contacto">
      <div className="container">
        <R className="chapter">
          <span className="rule"></span>
          <span className="small-caps">El refugio · Contacto</span>
        </R>

        <div className="footer-head">
          <R as="h2">
            <LineMask>El refugio.</LineMask>
          </R>
          <R className="body" delay={150} style={{ maxWidth: "44ch" }}>
            Te esperamos en un rincón diseñado en exclusiva para el bienestar de tus
            manos, tu piel y tu autoestima. Sin prisas, con toda la atención que te mereces.
          </R>
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
              <div className="note">Atención con cita previa para garantizar la exclusividad del espacio.</div>
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
          <img className="footer-logo-img" src={BRAND_ASSETS.logoWhite} alt={BUSINESS.name} />
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
    q: "¿Qué es la manicura rusa y cuánto dura?",
    a: "Es una técnica de alta precisión que retira mecánicamente la cutícula con tornos específicos, logrando un esmaltado impecable que nace bajo el pliegue de la piel. Con nivelación de matriz y rubber base, la durabilidad supera las 3 semanas."
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
              <LineMask>Todo lo que</LineMask>
              <LineMask delay={120}>quieres <em style={{ fontFamily: "var(--serif)" }}>saber</em>.</LineMask>
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
  useSitePreloader();
  return (
    <React.Fragment>
      <Nav />
      <main id="contenido">
        <Hero />
        <Interlude id="interlude-1"
        src={SITE_IMAGES.pigmentDetail}
        placeholder="Detalle macro — pigmento, agua, gesto del pincel"
        label="Micropigmentación"
        quote={<>Cada trazo, una obra de <em style={{ fontFamily: "var(--serif)" }}>precisión</em>.</>} />
        <MicroSection />
        <Interlude id="interlude-2"
        src={SITE_IMAGES.nailDetail}
        placeholder="Mano de manicura · detalle macro"
        label="Uñas de Autor"
        quote={<>Esculpir la elegancia sobre la <em style={{ fontFamily: "var(--serif)" }}>salud natural</em>.</>} />
        <NailsSection />
        <Interlude id="interlude-3"
        src={SITE_IMAGES.facialCabin}
        placeholder="Cabina · velas, humo de aromaterapia"
        label="Estética facial"
        quote={<>Silenciar el ruido. <em style={{ fontFamily: "var(--serif)" }}>Devolver el resplandor</em>.</>} />
        <FacialSection />
        <BodySection />
        <TestimonialsSection />
        <TrackSection />
        <FaqSection />
      </main>
      <FooterSection />
      <WhatsAppFab />
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
