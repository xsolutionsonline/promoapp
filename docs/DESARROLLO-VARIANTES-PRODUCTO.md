# Variantes de producto (color/talla) — plan de desarrollo

## 1. Diagnóstico del estado actual

Ya existe parte de esto a medias, y hay una pieza rota que hay que saber que está rota antes de tocar nada:

- **Modelo de datos** (`src/app/models/product.model.ts`): `ProductVariant { color?, colorCode?, size?, stock }` y `Product.variants?: ProductVariant[]` **ya existen** y son opcionales.
- **Admin (`create-product.page.ts`/`.html`)**: ya tiene un modal funcional para agregar/quitar variantes (`openVariantModal`, `addVariantFromModal`, `removeVariant`, `variants` FormArray) y las guarda tal cual en el producto. Esta parte **ya sirve y no hay que rehacerla**.
- **Storefront (`product-detail.page.ts`), líneas 300-315**: lee `data.variants[0].colors` y `data.variants[0].sizes` — una forma de datos **completamente distinta** a la que realmente se guarda (`[{color, colorCode, size, stock}, ...]`). Como el admin nunca escribe `variants[0].colors`/`.sizes`, **`colorItems`/`sizeItems` siempre quedan vacíos** y el selector de color/talla en el checkout sheet (HTML líneas 272-310) nunca se muestra hoy en día. Es código muerto que parece funcionar pero no.
- **`isColorCheck`/`isSizeCheck`** (líneas 901-917) solo marcan visualmente `item.selectSize = true/false`; **nada lee esa selección** para incluirla en la orden.
- **`submitCheckout()`** (la función que realmente crea el pedido en la colección `dropi-orders`) arma el payload a partir de `selectedGroup` (combo/`priceGroups`) — hoy **no existe ningún campo de color/talla en la orden**.
- **Nota sobre Dropi**: el código Dropi (`ID DE PRODUCTO` en la orden) sigue saliendo, sin cambios, de `selectedGroup.dropiCodes` — la asociación de qué código corresponde a cada variante la maneja el admin manualmente (fuera del alcance de este desarrollo). La app solo necesita capturar qué variante eligió el comprador y mostrarla junto al pedido para que quien procese la orden sepa qué despachar.
- **`cart.page.ts` / `checkout.page.ts` / `thankyou.page.ts` / `wishlist.page.html`**: usan otro concepto de "variants" (líneas de carrito con `selectedVariants: [{type:'group'|'color'|'size', ...}]`) que **no tiene productor en ningún lado del código actual** — es el remanente del theme/demo original de Ionic, antes de pivotear al modelo actual de landing page por producto con checkout embebido. No hay evidencia de que esté en uso real.

**Conclusión:** la pieza que falta construir es conectar las variantes ya guardadas por el admin con la UI de selección del comprador y con la orden que se guarda en `dropi-orders` (como metadata visible, no como lógica de fulfillment automática). Todo lo demás (modelo, formulario admin) ya está.

## 2. Alcance

**Dentro de alcance:**
- `src/app/product-detail/product-detail.page.ts` / `.html` / `.scss` (selector de variante + inclusión en la orden)
- `src/app/settings/create-product/create-product.page.ts` / `.html` (validación de variantes duplicadas)
- `src/app/models/product.model.ts` (extender `DropiOrder` para registrar la variante elegida)

**Fuera de alcance (no tocar):**
- `cart.page.ts`, `checkout.page.ts`, `thankyou.page.ts`, `wishlist.page.html` — flujo legacy sin productor de datos real; tocarlos no aporta y agrega riesgo.
- `product-detail-modal.page.ts` — no referencia variantes hoy; si en el futuro se decide usarlo, es un desarrollo aparte.
- **Asociación de códigos Dropi por variante o por unidad de combo** — queda manual, la maneja el admin como ya lo hace hoy con los combos (`dropiCodes`/`dropiMainCode`/`dropiQuantities`). No se agrega ningún campo ni UI nueva para esto.

## 3. Decisiones de diseño confirmadas

1. **¿Combos (`priceGroups`) y variantes pueden coexistir en el mismo producto?**
   Sí. El selector de variante aparece siempre que `product.variants.length > 0`, independiente de si hay combos — se quita la condición `&& !(groupItems.length > 0)` que hoy hace al HTML mutuamente excluyente (esa condición nunca se cumplía de todos modos, porque `colorItems` siempre estaba vacío).
2. **¿El stock de la variante bloquea la compra?**
   `ProductVariant.stock` se usa solo como señal visual: si `stock === 0`, la opción se muestra deshabilitada/tachada. No se decrementa automáticamente (eso requeriría una transacción de Firestore que no existe hoy) — es preventivo, no autoritativo.
3. **¿Es obligatorio elegir variante si el producto tiene variantes?**
   Sí. `submitCheckout()` bloquea con un toast si `product.variants.length > 0` y falta elegir color y/o talla — mismo patrón que la validación de dirección existente.
4. **¿Qué código Dropi se usa?**
   El que ya trae el combo elegido (`selectedGroup.dropiCodes`), sin cambios. La app no intenta deducir ni sustituir códigos por variante — el admin asocia los códigos Dropi correctos a cada combo manualmente, como ya lo hace hoy. La variante elegida se guarda como metadata (color/talla) junto a la orden para que quien despache sepa qué enviar.

## 4. Plan de implementación

### Paso 1 — Arreglar la lectura de variantes en `product-detail.page.ts`
Reemplazar el bloque de `initializeProductData()` (líneas ~309-315) que lee `data.variants[0].colors/.sizes` por lectura directa de `data.variants: ProductVariant[]`:

```ts
this.productVariants = data.variants || [];
this.selectedColor = null;
this.selectedSize = null;
```

Derivar las listas de colores y tallas **únicas** a partir de `productVariants` (un color puede repetirse en varias tallas y viceversa):

```ts
get colorOptions() {
  const seen = new Map<string, { color: string; colorCode: string }>();
  this.productVariants.forEach(v => { if (v.color && !seen.has(v.color)) seen.set(v.color, { color: v.color, colorCode: v.colorCode }); });
  return [...seen.values()];
}
get sizeOptions() {
  return [...new Set(this.productVariants.filter(v => v.size).map(v => v.size))];
}
```

Esto reemplaza `colorItems`/`sizeItems` tal cual existían (código muerto) — se eliminan esas dos propiedades y las funciones `isColorCheck/isSelectedColorCheck/isSizeCheck/isSelectSizeCheck` se reescriben para setear `selectedColor`/`selectedSize` en vez de togglear `item.selectSize`.

### Paso 2 — Resolver la variante seleccionada y su stock
```ts
get matchedVariant(): ProductVariant | null {
  return this.productVariants.find(v =>
    (!v.color || v.color === this.selectedColor) &&
    (!v.size || v.size === this.selectedSize)
  ) || null;
}
get selectedVariantOutOfStock(): boolean {
  return !!this.matchedVariant && this.matchedVariant.stock <= 0;
}
```

### Paso 3 — Actualizar el HTML del checkout sheet
En `product-detail.page.html` líneas 272-310:
- Cambiar `*ngIf="colorItems.length > 0 && !(groupItems...)"` → `*ngIf="colorOptions.length > 0"` (se quita la exclusión con combos, decisión 3.1).
- Igual para `sizeItems` → `sizeOptions`.
- Cambiar el binding de selección de `item.selectSize` a `selectedColor === item.color` / `selectedSize === item.size`.
- Agregar clase visual `disabled`/tachado cuando `matchedVariant?.stock <= 0`.
- Mostrar un mensaje de validación si falta elegir color/talla al intentar enviar el pedido (decisión 3.3).

Nota sobre stock por opción individual (no por combinación completa): si el producto tiene color+talla cruzados, mostrar "sin stock" por swatch individual requeriría decidir qué significa que un *color* tenga stock (suma de sus tallas, o solo si hay alguna talla con stock > 0). Mantenerlo simple: deshabilitar la opción final solo cuando `matchedVariant` (color+talla ya elegidos) da `stock <= 0`.

### Paso 4 — Incluir la variante en la orden
En `submitCheckout()` (línea ~944 en adelante), agregar antes de construir `order`:

```ts
if (this.productVariants.length > 0 && !this.matchedVariant) {
  // toast: "Elige color/talla antes de continuar." — return, igual patrón
  // que la validación de dirección existente.
}
```

El bloque que arma `dropiCodes`/`dropiQuantities`/`dropiValues`/`mainCode` (líneas 958-987) **no se toca** — sigue saliendo de `selectedGroup` exactamente como hoy (decisión 3.4).

Se agrega únicamente el campo informativo en el objeto `order` (aditivo, no reemplaza nada):

```ts
order.variant = this.matchedVariant
  ? { color: this.matchedVariant.color || null, size: this.matchedVariant.size || null }
  : null;
```

Esto no cambia ninguna columna de `DROPI_ORDER_COLUMNS` (el formato de export masivo a Excel) — es un campo extra en el documento de Firestore, visible desde el panel admin/"Mis pedidos" para que quien despache sepa qué color/talla enviar, cruzándolo manualmente con el código Dropi del combo como ya se hace hoy.

### Paso 5 — `product.model.ts`
Extender `DropiOrder` con el campo opcional:
```ts
export interface DropiOrder {
  ...
  variant?: { color: string | null; size: string | null } | null;
}
```
Es un campo opcional nuevo — no afecta ninguna orden ni producto existente.

### Paso 6 — Admin: validación de duplicados en `create-product.page.ts`
Único ajuste necesario del lado admin: en `addVariantFromModal`, validar que no se repita la misma combinación color+talla dos veces (hoy no hay chequeo). No se agrega selector de código Dropi ni ningún campo nuevo en `PriceGroup` — eso queda fuera de alcance (ver sección 2).

## 5. Cómo garantizar que los productos SIN variantes no se afectan

Esta es la parte crítica del pedido. Todo el desarrollo de arriba queda detrás de un único guard: `product.variants && product.variants.length > 0`.

- `Product.variants` sigue siendo **opcional** — un producto sin el campo (o con array vacío) sigue exactamente el mismo camino de hoy: sin selector de color/talla, sin validación nueva en `submitCheckout()`, sin campo `variant` en la orden (queda `null`).
- El bloque de combos (`groupItems`/`pdp-groups`/`pdp-simple-price`) y la construcción de `dropiCodes`/`dropiQuantities`/`dropiValues`/`mainCode` **no se tocan en absoluto** — exactamente el mismo código de hoy, para todos los productos, con o sin variantes.
- `DROPI_ORDER_COLUMNS` (las columnas del Excel de Dropi) no cambia — `variant` es un campo adicional en el documento de Firestore, no una columna del export masivo.
- No se toca `cart.page.ts`/`checkout.page.ts`/`thankyou.page.ts` — cero riesgo de regresión ahí.

## 6. Verificación

Según la preferencia ya establecida, la verificación es con `ng build` (sin `ng serve` + Chrome). Checklist manual de código a revisar tras el build limpio:
1. Producto sin `variants` (o `variants: []`): confirmar que `colorOptions`/`sizeOptions` devuelven `[]`, que el bloque HTML no se renderiza, y que `submitCheckout()` no entra en la validación nueva ni agrega `order.variant`.
2. Producto con solo color (sin talla): confirmar que solo aparece el selector de color y que `matchedVariant` resuelve bien con `size` undefined.
3. Producto con color + talla cruzados: confirmar que `matchedVariant` encuentra la combinación exacta y no una parcial.
4. Producto con variantes + combo (`priceGroups`) al mismo tiempo: confirmar que ambos selectores se muestran, que `dropiCodes` sigue saliendo del combo sin cambios, y que `order.variant` trae el color/talla elegido además del combo.
5. Intentar enviar el pedido sin elegir variante en un producto que las tiene: confirmar que se bloquea con el toast y no se crea la orden.
6. Variante con `stock: 0`: confirmar que se muestra deshabilitada/tachada en el selector.

## 7. Alta rápida — formato de pegado para combos y variantes

⚠️ **Pendiente de implementar** en `parseQuickAddCopy`/`applyQuickAdd` (`create-product.page.ts`) — por ahora son solo los formatos acordados, el parser de "Alta rápida" (ver primera conversación de esta sesión) todavía no reconoce estas dos secciones. Cuando se implementen, se agregan como dos claves nuevas en `QUICK_ADD_HEADER_PATTERNS` (`combos`, `variants`), siguiendo el mismo patrón que `benefits`/`faqs`/`comparison`.

### Ejemplo — sección "7. Combos"
Una línea por combo: `Nombre | Precio tachado | Precio oferta | Precio con bono (opcional)`. Los códigos Dropi **no** van aquí — se asocian manualmente en el formulario después de pegar, como ya funciona hoy (ver decisión 3.4 sobre Dropi).

```
7. Combos
1 Unidad | 129900 | 89900
Pack x2 | 259800 | 149900
Pack x3 | 389700 | 199900 | 179900
```

### Ejemplo — sección "8. Variantes"
El formato de cada línea depende de si la variante se distingue por **color** o por **talla/diseño** — esto decide si en el storefront se muestra como círculo de color o como botón de texto (ver Paso 3):

**Caso color** (círculo con el hex): `Nombre del color | Código hex | Stock (opcional)`
```
8. Variantes
Rojo | #E63946 | 30
Azul | #1D3557 | 20
Verde | #2A9D8F | 0
```

**Caso talla/diseño** (botón de texto, ej. una cobija con 24 diseños): `Nombre | Stock (opcional)` — sin código hex, porque no es un color real.
```
8. Variantes
Flores Rosadas | 30
Rayas Azules | 15
Elefantes | 0
```

Un producto usa un solo tipo de línea en su sección "8. Variantes" (todas por color, o todas por talla/diseño) — no se mezclan ambos formatos en el mismo pegado. Si una línea no trae stock, el parser debe usar un valor por defecto razonable (ej. 999) que luego se ajusta a mano en el formulario.
