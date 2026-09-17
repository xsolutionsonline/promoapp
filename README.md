# Guía de despliegue

## 1. Desplegar la app web (Firebase Hosting)

Este proyecto ya usa Firebase (Firestore, Storage) con el proyecto `bigoff-e8e4d`, así que Firebase Hosting es la forma más simple de publicar la versión web: mismo proyecto, mismo login, un solo comando.

### Requisitos previos

- Tener Node.js y npm instalados (los mismos que usas para `npm start`).
- Tener acceso (rol Editor o superior) al proyecto de Firebase `bigoff-e8e4d` en https://console.firebase.google.com.

### Paso a paso

1. **Instalar Firebase CLI** (si no la tienes instalada globalmente):
   ```sh
   npm install -g firebase-tools
   ```

2. **Iniciar sesión con tu cuenta de Google:**
   ```sh
   firebase login
   ```
   Se abre el navegador para iniciar sesión con la cuenta que tiene acceso al proyecto `bigoff-e8e4d`.

3. **Inicializar Hosting en el proyecto** (solo la primera vez, desde la raíz del repo):
   ```sh
   firebase init hosting
   ```
   Cuando pregunte, responde así:
   - `Please select an option` → **Use an existing project** → elige `bigoff-e8e4d`.
   - `What do you want to use as your public directory?` → escribe **`www`** (es la carpeta que genera `ng build`).
   - `Configure as a single-page app (rewrite all urls to /index.html)?` → **Yes** (necesario para que las rutas de Angular funcionen al recargar la página).
   - `Set up automatic builds and deploys with GitHub?` → **No** (opcional, es para CI/CD).
   - Si pregunta si quieres sobrescribir `www/index.html` → **No**.

   Esto crea `firebase.json` y `.firebaserc` en la raíz del proyecto — quedan guardados para los próximos despliegues.

4. **Construir la app para producción:**
   ```sh
   npm run build
   ```
   `ng build` ya usa la configuración de producción por defecto (toma `src/environments/environment.prod.ts`) y genera la carpeta `www/`.

5. **Publicar en Firebase Hosting:**
   ```sh
   firebase deploy --only hosting
   ```
   Al terminar, la terminal muestra la URL pública (algo como `https://bigoff-e8e4d.web.app`).

### Para futuras actualizaciones

Cada vez que quieras subir cambios nuevos, repite solo estos dos pasos:
```sh
npm run build
firebase deploy --only hosting
```

---

## 2. Compilar y desplegar la aplicación en Android

1. **Generar íconos y splash screen con Capacitor:**
   Asegúrate de tener tus imágenes en la carpeta `assets` (por ejemplo, `assets/icon.png` y `assets/splash.png`). Luego, ejecuta:
   ```sh
   npx @capacitor/assets generate
   ```

2. **Construir la aplicación de Ionic para producción:**
   ```sh
   ionic build --prod
   ```

3. **Sincronizar los cambios con el proyecto de Android:**
   ```sh
   ionic capacitor sync android
   ```

4. **Abrir el proyecto de Android en Android Studio:**
   ```sh
   ionic capacitor open android
   ```
   Una vez abierto en Android Studio, puedes generar un APK firmado para producción desde el menú `Build > Generate Signed Bundle / APK...`.
