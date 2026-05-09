# Estefania Panzariu – Nail Studio Website

## Sobre el proyecto
Página web premium para **Estefania Panzariu**, estudio de manicura de lujo en **Cuenca, España**. Partimos de una plantilla HTML5 comprada (DSAThemes "Lakrua") ya renombrada, que hay que adaptar completamente con el contenido y la identidad de Estefanía.

El documento de referencia estratégico está en `Creación Web Estefanía Panzariu_ Ideas y Dominio.docx`.

---

## Datos de Estefanía

| Campo | Valor |
|-------|-------|
| Nombre | Estefania Panzariu |
| Negocio | Estefania Panzariu Nail Studio |
| Dirección | Plaza de la Hispanidad, 1, 1B – 16001 Cuenca, España |
| Email | estefaniapanzariu@gmail.com |
| Reservas | https://www.fresha.com/es/lvp/estefania-panzariu-plaza-la-hispanidad-cuenca-85BMB3 |
| Instagram | @estefaniapanzariu |
| Horario doc | Lun-Vie 9:00–21:00 (verificar con Estefanía) |
| Horario web | Lun-Vie 10:00–20:00 / Sáb 10:00–19:00 / Dom cerrado |
| Dominio objetivo | estefaniapanzariu.com |

## Servicios principales

1. **Manicura Rusa** (35€, ~60 min) – Técnica E-File europea, fresado de cutículas
2. **Manicura Semipermanente** (25€, ~45 min)
3. **Manicura Express** (20€, ~30 min)
4. **Uñas de Gel Esculpido** (45€, ~90 min) – Full set
5. **Uñas de Gel con Reconstrucción** (55€, ~120 min) – Refuerzo estructural
6. **Nail Art de Vanguardia** (desde 15€) – Velvet, Cat Eye, Aura, Shimmer
7. **Polka Nails & Floral Minimalista** (desde 20€)
8. **Uñas Aura & Mismatched** (desde 22€)
9. **Carey (Tortoiseshell) & Degradado** (desde 20€)
10. **Milky Nails & Soft Neutrals** (desde 30€)
11. **Retirada de Gel/Semipermanente** (10€, ~20 min)
12. **Tratamiento Hidratante de Manos** (18€, ~25 min)

## Tendencias 2026 a destacar
- Milky Nails & Soft Neutrals (lujo silencioso)
- Velvet Nails & Cat Eye (pigmentos magnéticos)
- Shimmer, Efectos Nacarados & Tonos profundos (verde oliva, esmeralda)
- Polka Nails & Minimalismo Floral
- Uñas Aura, Mismatched & Carey (Tortoiseshell)
- Uñas cortas/almendradas/ovaladas son la forma dominante en 2026

## Identidad visual (según documento estratégico)
- **Estética**: Neo-brutalismo adaptado al lujo silencioso ("quiet luxury")
- **Paleta**: Marfil, rosa empolvado, beige translúcido, grises cálidos + acentos dorado cepillado o verde oliva
- **Tipografía**: Playfair Display (serif, headings) + Inter/sans-serif geométrica (body)
- **Animaciones**: Motion narrative con scroll suave, hover effects en galería
- **CSS activo**: `rose-theme.css`

## Posicionamiento y copywriting
- NO es "manicurista", ES "artista de uñas" / "atelier de arquitectura de uñas"
- Eslogan recomendado: "Arquitectura y cuidado para unas manos inolvidables"
- Justificar precios premium explicando técnica, seguridad e higiene
- Público objetivo: mujeres de poder adquisitivo medio-alto en Cuenca y zona

## Estructura de URLs (SEO)
- `/` – Homepage (index.html)
- `/about.html` – Sobre Estefanía / El Estudio
- `/services.html` – Hub de servicios
- `/pricing-1.html` – Menú de precios (mantener uno)
- `/gallery.html` – Galería de trabajos
- `/reviews.html` – Opiniones
- `/gift-cards.html` – Tarjetas regalo
- `/faqs.html` – Preguntas frecuentes
- `/blog-page.html` – Blog (contenido SEO local)
- `/booking.html` – Reservar cita (o redirigir a Fresha)
- `/contact.html` – Contacto
- `/locations.html` – Ubicación + mapa

## SEO local
- Schema.org `BeautySalon` + `NailSalon` ya implementado en `index.html`
- Palabras clave target: "manicura rusa Cuenca", "uñas de gel Cuenca", "nail art Cuenca"
- Geo-tags configurados correctamente (lat: 40.0703, lng: -2.1374)

## Estado de los archivos

### ✅ Bien adaptados
- `index.html` – Homepage ya bien configurada (SEO, contenido, schema)

### ⚠️ Necesitan corrección urgente
- `about.html` – Tiene lorem ipsum, texto inglés, footer con dirección de Los Ángeles
- Navegación: el mega-menú "Todas las Páginas" es artefacto de plantilla (eliminar)
- `index.html` statistic #4: etiqueta duplicada "Clientas Satisfechas" (debe decir algo diferente, como "Satisfacción")

### ❓ Páginas con decisión pendiente del cliente
- `careers.html` – ¿Estefanía trabaja sola o tiene equipo?
- `team.html` – ¿Hay equipo? ¿O usar como página biográfica de Estefanía?
- `pricing-2.html` – ¿Necesita dos páginas de precios?
- `single-post.html` – Demo de post de blog
- `booking.html` – ¿Formulario propio o redirigir solo a Fresha?
- `demo-1.html` a `demo-12.html` – Demos de plantilla, NO publicar

### 🗑️ A archivar/eliminar (demos de plantilla)
- `demo-1.html` a `demo-12.html` – Son demos del template original "Lakrua"

## Notas técnicas
- Plantilla base: DSAThemes "Lakrua" – HTML5/Bootstrap 5
- CSS temas disponibles: `rose-theme.css` (activo), `berry-theme.css`, `pink-theme.css`, `sienna-theme.css`
- JS: jQuery 3.7.1, Bootstrap, Owl Carousel, WOW.js para animaciones
- Booking: actualmente enlaza a Fresha externo
- Imágenes: pendiente de fotografía editorial real de Estefanía y sus trabajos
