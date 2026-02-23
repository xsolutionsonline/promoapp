# Pasos para compilar y desplegar la aplicación en Android

1. **Generar íconos y splash screen con Capacitor:**
   Asegúrate de tener tus imágenes en la carpeta `assets` (por ejemplo, `assets/icon.png` y `assets/splash.png`). Luego, ejecuta:
   ```sh
   npx @capacitor/assets generate
   ```

2.  **Construir la aplicación de Ionic para producción:**
    ```sh
    ionic build --prod
    ```

3.  **Sincronizar los cambios con el proyecto de Android:**
    ```sh
    ionic capacitor sync android
    ```

4.  **Abrir el proyecto de Android en Android Studio:**
    ```sh
    ionic capacitor open android
    ```
    Una vez abierto en Android Studio, puedes generar un APK firmado para producción desde el menú `Build > Generate Signed Bundle / APK...`.
