# Stefania Panzariu Studio

Web estática para el estudio de belleza de autor en Cuenca.

## Estructura

- `index.html`: documento principal, estilos globales, metadatos SEO y carga de scripts.
- `src/stefania-panzariu-site.jsx`: **fuente** del contenido y los componentes (editas aquí).
- `src/stefania-panzariu-site.js`: **artefacto compilado** que carga la web. No se edita a mano.
- `assets/images/`: imágenes optimizadas y con nombres descriptivos usadas en producción.
- `assets/brand/`: logotipos, isotipo e imagen de previsualización social (`og-social-preview.jpg`).
- `docs/`: notas de auditoría, SEO y diseño.

## Compilar (importante)

La web ya no compila JSX en el navegador (antes cargaba ~3 MB de Babel en cada visita).
Ahora el `.jsx` se precompila a `src/stefania-panzariu-site.js`, que es el archivo que se publica.

**Cada vez que edites `src/stefania-panzariu-site.jsx` debes recompilar:**

```bash
npm install        # solo la primera vez (React para el prerender)
npm run build      # compila el JSX y prerenderiza la home en index.html
```

`npm run build` hace dos cosas: compila el `.jsx` con esbuild y ejecuta
`scripts/prerender.mjs`, que mete el HTML de la home dentro de `<div id="root">`.
Así el contenido se ve antes de que cargue el JavaScript y Google lo lee directamente.
No edites a mano lo que hay entre `<div id="root">` y `<!-- /root -->`.

## Imágenes

Cada JPG de `assets/images/` tiene dos versiones WebP (`-800.webp` y la grande).
La web carga las WebP con `srcset`; los JPG se mantienen para redes sociales y datos
estructurados. Si añades una foto nueva, genera también sus WebP.

## Desarrollo local

```bash
python3 serve.py
```

La web queda disponible en `http://127.0.0.1:8000`.
Si ese puerto está ocupado, usa otro:

```bash
python3 serve.py 8001
```

## Datos publicados

- Dominio final: `https://stefaniavictoria.com/`.
- WhatsApp: `+34 690 699 205`.
- Email: `estefaniapanzariu@gmail.com`.
- Instagram: `https://www.instagram.com/victoria_e_p?igsh=MWppMjdoaXlhYWxpOA==`.

## Movimiento y efectos

- `FX` (en el `.jsx`) es un motor de scroll mínimo: cada sección registrada con
  `useProgress()` recibe la variable CSS `--p` (0 → 1) y el CSS hace el resto
  (foto del hero que se recoge en arco, cintas, interludios que se expanden,
  masajes en pantalla dividida, trayectoria horizontal).
- `assets/vendor/lenis.min.js` da el scroll con inercia, solo con ratón.
- `assets/js/landing-fx.js` aplica scroll suave y revelado en las páginas de servicio.
- Con "reducir movimiento" activado en el sistema, todo se muestra estático.
