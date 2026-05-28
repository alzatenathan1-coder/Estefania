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
npm run build      # compila una vez
npm run watch      # recompila automáticamente al guardar
```

No necesitas instalar nada: el script usa `npx esbuild` (se descarga y se cachea solo).

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

- Dominio final: `https://stefaniavictoria.es/`.
- WhatsApp: `+34 690 699 205`.
- Email: `estefaniapanzariu@gmail.com`.
- Instagram: `https://www.instagram.com/victoria_e_p?igsh=MWppMjdoaXlhYWxpOA==`.
