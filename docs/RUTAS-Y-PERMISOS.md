# Rutas de la app y quién debería poder entrar

Basado en `src/app/app-routing.module.ts` (actualizado 2026-09-09).

**Estado: implementado.** `src/app/guards/auth.guard.ts` y
`src/app/guards/admin.guard.ts` ya están aplicados con `canActivate` en las
rutas de abajo. Detalles técnicos y cómo dar de alta al primer admin, al final
de este documento.

## 1. Solo administrador

Gestión del catálogo y de pedidos. Ningún cliente debería poder navegar aquí.

| Ruta | Página | Por qué |
|---|---|---|
| `settings` | Hub de configuración/admin | Lista las secciones administrativas (toggles de configuración, acceso a productos) |
| `create-product` | Crear/editar producto | Escribe directo en la colección `products` |
| `product-list` | Listado admin de productos | Panel de gestión, con botón para editar/crear |
| `orders` | Pedidos Dropi (descarga Excel) | Expone datos de clientes (nombre, dirección, teléfono) de todos los pedidos |

`adminGuard` exige sesión de Firebase Auth **y** que el doc
`customers/{uid}` tenga `role: 'admin'`. Sin ese campo, cualquier cliente
logueado es redirigido a `/home` con un toast de "no tienes permisos".

## 2. Requiere sesión de cliente

Datos ligados a una cuenta específica (pedidos, direcciones, puntos, favoritos).

| Ruta | Página | Por qué |
|---|---|---|
| `my-account` | Cuenta / editar perfil | Datos del propio usuario |
| `my-order` | Mis compras | Ya filtra por `userUID` — sin sesión no tiene sentido mostrarla |
| `my-addresses` | Mis direcciones guardadas | Datos personales |
| `wishlist` | Favoritos | Lista ligada al usuario (`heartVis` por producto/usuario) |
| `reward-points` | Puntos de recompensa | Saldo ligado a la cuenta |

`authGuard` verifica la sesión de Firebase Auth (`authState`); si no hay
usuario, redirige a `/login?returnUrl=<ruta original>` y el login vuelve ahí
después de autenticar.

## 3. Sin restricción (público / invitado)

Navegación y compra tipo "pago contra entrega" — el checkout actual
(`product-detail` → modal COD) es deliberadamente sin login, para no perder
conversión. Por eso `cart`, `checkout` y `product-detail-modal` quedan aquí en
vez de en el grupo 2.

| Ruta | Página |
|---|---|
| `home` | Home |
| `list` | Listado de productos |
| `home-model` | Home alterno |
| `category-detail` | Detalle de categoría |
| `categories` | Categorías |
| `product-sort` / `product-size` / `product-price` / `product-color` | Filtros/orden de catálogo |
| `product-detail`, `product-detail/:id` | Ficha de producto (incluye links compartidos/directos) |
| `product-detail-modal` | Selección de variante/cantidad antes de comprar |
| `cart` | Carrito |
| `checkout` | Checkout COD |
| `thankyou` | Confirmación de pedido |
| `review` | Ver reseñas de producto |
| `login` / `register` / `forget` | Autenticación (deben ser públicas por definición) |
| `news` / `news-detail` | Contenido tipo blog |
| `contact-us` | Formulario de contacto |
| `splash-screen` | Modal de carga inicial |

**Nota sobre `review`:** ver reseñas es público; si en el futuro se agrega un
formulario para *escribir* una reseña, esa acción puntual sí debería exigir
sesión (no toda la ruta).

## Aparte: `test`

`test` parece una página de pruebas/desarrollo. No entra en ninguna de las tres
categorías porque no debería llegar a producción — conviene eliminarla del
`app-routing.module.ts` (o al menos sacarla del build de producción) en vez de
protegerla.

## Detalles de implementación

- `src/app/guards/auth.guard.ts` — `authGuard`, funcional (`CanActivateFn`).
  Lee la sesión con `authState(auth)` de `@angular/fire/auth`. Sin sesión →
  redirige a `/login?returnUrl=<url pedida>`.
- `src/app/guards/admin.guard.ts` — `adminGuard`. Igual que el anterior, pero
  además hace `getDoc(customers/{uid})` y exige `role === 'admin'`. Si el
  usuario está logueado pero no es admin, muestra un toast y redirige a
  `/home`.
- Se corrigieron dos huecos que habrían dejado los guards inservibles:
  - **`login.page.ts` no iniciaba sesión de verdad.** Buscaba el email en
    Firestore (`customers`) e ignoraba la contraseña por completo — cualquiera
    que supiera un email válido "entraba". Ahora llama a
    `signInWithEmailAndPassword`, así se crea una sesión real de Firebase Auth
    (la única que los guards reconocen), y respeta `returnUrl` para volver a
    donde el guard interrumpió la navegación.
  - **`logout()` en `app.component.ts` no cerraba la sesión de Firebase**,
    solo borraba banderas de `localStorage`. Ahora llama a `signOut(auth)`
    primero — si no, el guard seguía viendo una sesión válida después de
    "cerrar sesión".

### Cómo dar de alta al primer administrador

Todavía no hay UI para asignar roles. Para el primer admin, a mano en la
consola de Firebase:

1. El usuario debe registrarse una vez desde `/register` (esto crea su doc en
   `customers/{uid}`).
2. En Firestore Console → colección `customers` → documento de ese usuario →
   agregar el campo `role` (string) con valor `admin`.
3. Ese usuario ya puede entrar a `/settings`, `/create-product`,
   `/product-list` y `/orders`.

Cualquier doc de `customers` sin campo `role` (o con otro valor) se trata como
cliente normal.
