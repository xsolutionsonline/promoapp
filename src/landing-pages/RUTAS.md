# Rutas de las landing pages

## Producción (eurocityapp.com)

| Página | URL |
|---|---|
| Variquit PRO CPM1 — Landing | https://eurocityapp.com/variquit-pro/cpm1/ |
| Variquit PRO CPM1 — Gracias | https://eurocityapp.com/variquit-pro/cpm1/gracias.html |
| Variquit PRO CPM2 — Landing (original, sin tocar) | https://eurocityapp.com/variquit-pro/cpm2/ |
| Variquit PRO CPM3 — Landing (rediseño profesional) | https://eurocityapp.com/variquit-pro/cpm3/ |
| Variquit PRO CPM3 — Gracias | https://eurocityapp.com/variquit-pro/cpm3/gracias.html |

---

Estas páginas viven en `src/landing-pages/` y se copian tal cual a la raíz del sitio durante el build de Angular (ver `angular.json`, bloque `assets`: `input: src/landing-pages, output: /`). Por eso **no pasan por el router de Angular**, son HTML estático puro.

> **Estructura actual:** `variquit-pro/` contiene tres subcarpetas hermanas, cada una con su propio `index.html` y `assets`:
> - `variquit-pro/cpm1/` — landing editada en este chat, con `gracias.html` propia.
> - `variquit-pro/cpm2/` — **template original sin modificar** (fondo gris, CSS/JS legacy del proveedor).
> - `variquit-pro/cpm3/` — rediseño profesional del contenido de cpm2 (mismo copy e imágenes, nueva UI: fondo blanco, tipografía Poppins/Inter, cards, animaciones), ahora con su propia `gracias.html`.

## Variquit PRO — CPM1

| Página | Carpeta local | Ruta publicada |
|---|---|---|
| Landing principal | `src/landing-pages/variquit-pro/cpm1/index.html` | `/variquit-pro/cpm1/` |
| Página de gracias | `src/landing-pages/variquit-pro/cpm1/gracias.html` | `/variquit-pro/cpm1/gracias.html` |

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

## Cómo abrir cada una

**1. Directo en el navegador (sin servidor), para revisar diseño rápido:**
```
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm1/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm1/gracias.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm2/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm2/gracias.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm3/index.html
file:///C:/Users/PC/Documents/PROYECTOS/promoapp/src/landing-pages/variquit-pro/cpm3/gracias.html
```

**2. Con `ng serve` (servidor de desarrollo, puerto por defecto 4200):**
```
http://localhost:4200/variquit-pro/cpm1/
http://localhost:4200/variquit-pro/cpm1/gracias.html
http://localhost:4200/variquit-pro/cpm2/
http://localhost:4200/variquit-pro/cpm2/gracias.html
http://localhost:4200/variquit-pro/cpm3/
http://localhost:4200/variquit-pro/cpm3/gracias.html
```

**3. Después de `ng build` (carpeta de salida `www/`):**
```
www/variquit-pro/cpm1/index.html
www/variquit-pro/cpm1/gracias.html
www/variquit-pro/cpm2/index.html
www/variquit-pro/cpm2/gracias.html
www/variquit-pro/cpm3/index.html
www/variquit-pro/cpm3/gracias.html
```

**4. Ya publicado (dominio real):**
```
https://eurocityapp.com/variquit-pro/cpm1/
https://eurocityapp.com/variquit-pro/cpm1/gracias.html
https://eurocityapp.com/variquit-pro/cpm2/
https://eurocityapp.com/variquit-pro/cpm2/gracias.html
https://eurocityapp.com/variquit-pro/cpm3/
https://eurocityapp.com/variquit-pro/cpm3/gracias.html
```

No hace falta escribir `index.html` al final — el servidor lo resuelve solo cuando la ruta termina en `/`. Solo `gracias.html` necesita el nombre completo porque es otro archivo, no el índice de la carpeta.

También accesible vía el dominio de Firebase Hosting (proyecto `bigoff-e8e4d`, ver `.firebaserc`):
```
https://bigoff-e8e4d.web.app/variquit-pro/cpm1/
https://bigoff-e8e4d.web.app/variquit-pro/cpm2/
https://bigoff-e8e4d.web.app/variquit-pro/cpm3/
```

> Nota: el `firebase.json` tiene un rewrite general `** → /index.html` (para que la app Angular funcione como SPA), pero Firebase Hosting sirve primero cualquier archivo estático que exista con ese nombre exacto — como estas landing pages sí existen como archivos reales después del build, se sirven directo y el rewrite no las afecta.
