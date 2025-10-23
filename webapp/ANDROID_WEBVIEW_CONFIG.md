# Configuración de Android WebView para Persistencia de Sesión

## Importante para el Desarrollador Android

Para asegurar que los usuarios **NO se deslogueen** cuando cierren la app en Android, debes configurar correctamente el WebView con las siguientes opciones:

### Configuración Requerida en Android (Java/Kotlin)

```java
// En tu Activity donde cargas el WebView

WebView webView = findViewById(R.id.webview);
WebSettings webSettings = webView.getSettings();

// CRÍTICO: Habilitar JavaScript
webSettings.setJavaScriptEnabled(true);

// CRÍTICO: Habilitar DOM Storage (localStorage/sessionStorage)
webSettings.setDomStorageEnabled(true);

// CRÍTICO: Habilitar Database Storage
webSettings.setDatabaseEnabled(true);

// Configurar la ruta para la base de datos
String databasePath = this.getApplicationContext().getDir("databases", Context.MODE_PRIVATE).getPath();
webSettings.setDatabasePath(databasePath);

// Habilitar cache
webSettings.setAppCacheEnabled(true);
webSettings.setAppCachePath(getApplicationContext().getCacheDir().getAbsolutePath());

// Permitir contenido mixto si es necesario
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

// NO limpiar el cache cuando se cierre la app
// NO llamar a webView.clearCache() en onDestroy()
// NO llamar a webView.clearHistory() en onDestroy()
```

### Configuración en Kotlin

```kotlin
val webView: WebView = findViewById(R.id.webview)
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true  // CRÍTICO para localStorage
    databaseEnabled = true
    setAppCacheEnabled(true)
    setAppCachePath(applicationContext.cacheDir.absolutePath)
}

// NO destruir el WebView innecesariamente
// NO limpiar datos en onPause() o onStop()
```

### AndroidManifest.xml

Asegúrate de tener los permisos necesarios:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### IMPORTANTE: NO hacer esto

```java
// ❌ NO hacer esto en onDestroy(), onPause(), o onStop()
webView.clearCache(true);
webView.clearHistory();
webView.clearFormData();
CookieManager.getInstance().removeAllCookies(null);

// ❌ NO usar esto
webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
```

### Verificación

Para verificar que localStorage está funcionando:

1. Abre la app y haz login
2. Cierra completamente la app (swipe en recientes)
3. Vuelve a abrir la app
4. El usuario debe seguir logueado

### Debugging

Si los usuarios se desloguean, verifica en Android Studio Logcat:

```
adb logcat | grep -i "localStorage\|DOMStorage\|WebView"
```

## Funcionamiento Técnico

La app web usa:
- `localStorage.setItem('currentUser', username)` - Guarda el usuario
- `localStorage.setItem('persistentSession', 'true')` - Flag de sesión persistente
- `localStorage.setItem('lastActivity', timestamp)` - Última actividad
- `localStorage.setItem('sobrietyApp_${username}', data)` - Datos del usuario

Todos estos datos DEBEN persistir entre cierres de app.
