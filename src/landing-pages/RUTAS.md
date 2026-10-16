# Rutas de las landing pages

## Producción (eurocityapp.com)

| Página | URL | Recomendado AR |
|---|---|:---:|
| Variquit PRO CPM1 — Landing | https://eurocityapp.com/variquit-pro/cpm1/ | ⭐ |
| Variquit PRO CPM1 — Gracias | https://eurocityapp.com/variquit-pro/cpm1/gracias.html | ⭐ |
| Variquit PRO CPM2 — Landing (original, sin tocar) | https://eurocityapp.com/variquit-pro/cpm2/ | |
| Variquit PRO CPM3 — Landing (rediseño profesional) | https://eurocityapp.com/variquit-pro/cpm3/ | |
| Variquit PRO CPM3 — Gracias | https://eurocityapp.com/variquit-pro/cpm3/gracias.html | |
| DetoxSi CPM1 — Landing (original, sin tocar) | https://eurocityapp.com/detox-si/cpm1/ | |
| DetoxSi CPM2 — Landing (rediseño profesional) | https://eurocityapp.com/detox-si/cpm2/ | |
| DetoxSi CPM2 — Gracias | https://eurocityapp.com/detox-si/cpm2/gracias.html | |
| DetoxSi CPM3 — Landing (rediseño profesional) | https://eurocityapp.com/detox-si/cpm3/ | ⭐ |
| DetoxSi CPM3 — Gracias | https://eurocityapp.com/detox-si/cpm3/gracias.html | ⭐ |
| Megasteel CPM1 — Landing (original, sin tocar) | https://eurocityapp.com/megasteel/cpm1/ | |
| Megasteel CPM1 — Gracias | https://eurocityapp.com/megasteel/cpm1/gracias.html | |
| Megasteel CPM2 — Landing (mejor versión) | https://eurocityapp.com/megasteel/cpm2/ | ⭐ |
| Megasteel CPM2 — Gracias | https://eurocityapp.com/megasteel/cpm2/gracias.html | ⭐ |

> **⭐ Recomendado AR** = la variante con mayor potencial de conversión para Argentina, elegida por estructura de contenido/ángulo de venta (no por datos reales de ads, que esta cuenta todavía no tiene). Detalle del porqué de cada elección en la sección de cada producto más abajo.

---

Estas páginas viven en `src/landing-pages/` y se copian tal cual a la raíz del sitio durante el build de Angular (ver `angular.json`, bloque `assets`: `input: src/landing-pages, output: /`). Por eso **no pasan por el router de Angular**, son HTML estático puro.

> **Patrón de trabajo:** cada producto tiene un `cpmN` "original" (template del proveedor, sin tocar) y un `cpm3` con el rediseño profesional propio (fondo claro, tipografía Poppins/Inter, cards, animaciones, imágenes optimizadas). El original se deja intacto como referencia; todo el trabajo nuevo vive en su propio `cpm3`, autocontenido (sin depender de assets de otras carpetas).

## Variquit PRO — CPM1 ⭐ Recomendado AR

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/variquit-pro/cpm1/index.html` | `/variquit-pro/cpm1/` |
| Página de gracias | `src/landing-pages/variquit-pro/cpm1/gracias.html` | `/variquit-pro/cpm1/gracias.html` |

> Por qué: tiene más estructura de persuasión que cpm3 (incluye "Problema cotidiano", una sección de agitación del dolor que cpm3 no tiene) y ya trae popup + sticky-cta de buena calidad. Imágenes optimizadas (684 KB → 412 KB): redimensionadas al tamaño real de despliegue y recomprimidas en WebP — ya pesa prácticamente igual que cpm3.

## Variquit PRO — CPM2 (original, intacta)

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/variquit-pro/cpm2/index.html` | `/variquit-pro/cpm2/` |
| Página de gracias | `src/landing-pages/variquit-pro/cpm2/gracias.html` | `/variquit-pro/cpm2/gracias.html` |

## Variquit PRO — CPM3 (rediseño profesional de cpm2)

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/variquit-pro/cpm3/index.html` | `/variquit-pro/cpm3/` |
| Página de gracias | `src/landing-pages/variquit-pro/cpm3/gracias.html` | `/variquit-pro/cpm3/gracias.html` |

## DetoxSi — CPM1 (original, intacta)

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/detox-si/cpm1/index.html` | `/detox-si/cpm1/` |
| Página de gracias | `src/landing-pages/detox-si/cpm1/gracias.html` | `/detox-si/cpm1/gracias.html` |

## DetoxSi — CPM2 (rediseño profesional, sobrescrita)

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/detox-si/cpm2/index.html` | `/detox-si/cpm2/` |
| Página de gracias | `src/landing-pages/detox-si/cpm2/gracias.html` | `/detox-si/cpm2/gracias.html` |

> Esta variante traía un formulario roto (sin `action`, sin campos ocultos de la oferta, sin validación, sin Pixel de Meta) — se reconstruyó completa: mismo contenido y fotos reales (producto en comprimidos, testimonios, médico), formulario conectado a `miembros.ecomgenio.com/order` con `offer=1561`, Pixel agregado, e imágenes optimizadas (~4.9 MB → 233 KB).

## DetoxSi — CPM3 (rediseño profesional de cpm1) ⭐ Recomendado AR

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/detox-si/cpm3/index.html` | `/detox-si/cpm3/` |
| Página de gracias | `src/landing-pages/detox-si/cpm3/gracias.html` | `/detox-si/cpm3/gracias.html` |

> Por qué: cpm2 y cpm3 venden ángulos distintos — cpm2 es "bienestar digestivo" (9 secciones, tono SaaS moderno); cpm3 es "limpieza de parásitos" (14 secciones: alerta → síntomas/autoevaluación → cómo entran → autoridad/experto → testimonios → oferta). Esa estructura larga tipo direct-response, con el ángulo de parásitos, es la fórmula que históricamente mejor convierte en tráfico frío de LatAm para productos de salud. Imágenes optimizadas (408 KB → 312 KB): recompresión WebP de 13 imágenes (ya tenían el tamaño en píxeles correcto, solo estaban guardadas con calidad más alta de la necesaria) + conversión de `expert.jpg` a WebP.

## Megasteel — CPM1 (original, intacta)

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/megasteel/cpm1/index.html` | `/megasteel/cpm1/` |
| Página de gracias | `src/landing-pages/megasteel/cpm1/gracias.html` | `/megasteel/cpm1/gracias.html` |

## Megasteel — CPM2 (mejor versión) ⭐ Recomendado AR

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/megasteel/cpm2/index.html` | `/megasteel/cpm2/` |
| Página de gracias | `src/landing-pages/megasteel/cpm2/gracias.html` | `/megasteel/cpm2/gracias.html` |

> A diferencia de DetoxSi/Variquit PRO, el CPM1 de Megasteel ya venía con un diseño propio decente (cards, animaciones, Inter/Montserrat) en vez del típico template de proveedor. El CPM2 no es una reconstrucción desde cero: parte del mismo contenido y formulario (que ya funcionaba bien, con Pixel de Meta y `offer=1623` conectado a `miembros.ecomgenio.com/order`) y se enfoca en: eliminar 4 imágenes sin usar, convertir y comprimir todas las imágenes a WebP (carpeta de 3.4 MB → 388 KB, luego recomprimida a 356 KB en una segunda pasada), tipografía Poppins (en vez de Montserrat, para alinear con el resto de landings), meta tags/canonical para SEO, y arreglar un bug real en `main.js` (`handleContactForm()` se llamaba pero nunca estaba definida) agregando validación de formulario con mensajes de error visibles.

## Cómo abrir cada una

**1. Directo en el navegador (sin servidor), para revisar diseño rápido:**
```
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm1/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm2/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm3/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/detox-si/cpm1/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/detox-si/cpm2/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/detox-si/cpm2/gracias.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/detox-si/cpm3/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/detox-si/cpm3/gracias.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/megasteel/cpm1/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/megasteel/cpm2/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/megasteel/cpm2/gracias.html
```

**2. Con `ng serve` (servidor de desarrollo, puerto por defecto 4200):**
```
http://localhost:4200/variquit-pro/cpm1/
http://localhost:4200/variquit-pro/cpm2/
http://localhost:4200/variquit-pro/cpm3/
http://localhost:4200/detox-si/cpm1/
http://localhost:4200/detox-si/cpm2/
http://localhost:4200/detox-si/cpm2/gracias.html
http://localhost:4200/detox-si/cpm3/
http://localhost:4200/detox-si/cpm3/gracias.html
http://localhost:4200/megasteel/cpm1/
http://localhost:4200/megasteel/cpm2/
http://localhost:4200/megasteel/cpm2/gracias.html
```

**3. Después de `ng build` (carpeta de salida `www/`):**
```
www/variquit-pro/cpm1/index.html
www/variquit-pro/cpm2/index.html
www/variquit-pro/cpm3/index.html
www/detox-si/cpm1/index.html
www/detox-si/cpm2/index.html
www/detox-si/cpm2/gracias.html
www/detox-si/cpm3/index.html
www/detox-si/cpm3/gracias.html
www/megasteel/cpm1/index.html
www/megasteel/cpm2/index.html
www/megasteel/cpm2/gracias.html
```

**4. Ya publicado (dominio real):**
```
https://eurocityapp.com/variquit-pro/cpm1/
https://eurocityapp.com/variquit-pro/cpm2/
https://eurocityapp.com/variquit-pro/cpm3/
https://eurocityapp.com/detox-si/cpm1/
https://eurocityapp.com/detox-si/cpm2/
https://eurocityapp.com/detox-si/cpm2/gracias.html
https://eurocityapp.com/detox-si/cpm3/
https://eurocityapp.com/detox-si/cpm3/gracias.html
https://eurocityapp.com/megasteel/cpm1/
https://eurocityapp.com/megasteel/cpm2/
https://eurocityapp.com/megasteel/cpm2/gracias.html
```

No hace falta escribir `index.html` al final — el servidor lo resuelve solo cuando la ruta termina en `/`. Solo `gracias.html` necesita el nombre completo porque es otro archivo, no el índice de la carpeta.

También accesible vía el dominio de Firebase Hosting (proyecto `bigoff-e8e4d`, ver `.firebaserc`):
```
https://bigoff-e8e4d.web.app/variquit-pro/cpm3/
https://bigoff-e8e4d.web.app/detox-si/cpm2/
https://bigoff-e8e4d.web.app/detox-si/cpm3/
```

> Nota: el `firebase.json` tiene un rewrite general `** → /index.html` (para que la app Angular funcione como SPA), pero Firebase Hosting sirve primero cualquier archivo estático que exista con ese nombre exacto — como estas landing pages sí existen como archivos reales después del build, se sirven directo y el rewrite no las afecta.
