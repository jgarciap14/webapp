# Guía de Configuración - Sistema de Autenticación con Backend

## ¡Importante! Has Actualizado a Autenticación Segura

Tu aplicación ahora usa un backend con PostgreSQL para almacenar las contraseñas de forma segura usando bcrypt.

## Opciones de Configuración

Tienes **dos opciones**:

### Opción 1: Solo Frontend (Sin Backend) - Modo Actual
- ✅ **Más fácil** - No requiere configuración adicional
- ✅ Funciona directamente abriendo los archivos HTML
- ⚠️ Las contraseñas se guardan en localStorage (menos seguro)
- ⚠️ No recomendado para producción

**Para usar esta opción**: No hagas nada, ya está funcionando.

### Opción 2: Con Backend (Recomendado para Producción)
- ✅ **Más seguro** - Contraseñas hasheadas con bcrypt
- ✅ Base de datos PostgreSQL
- ✅ JWT para sesiones
- ✅ Rate limiting en servidor
- ⚠️ Requiere PostgreSQL instalado
- ⚠️ Requiere configuración inicial

## Configuración del Backend (Opción 2)

### Paso 1: Instalar PostgreSQL

#### En macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### En Windows:
Descarga e instala desde: https://www.postgresql.org/download/windows/

#### En Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Paso 2: Crear la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# En el prompt de psql, ejecuta:
CREATE DATABASE sobriety_app;
\q
```

### Paso 3: Inicializar las Tablas

```bash
# Desde la raíz del proyecto
psql -U postgres -d sobriety_app -f server/init-db.sql
```

### Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` (ya creado) y actualiza:

```env
DB_PASSWORD=tu_contraseña_de_postgresql
JWT_SECRET=genera_un_secreto_seguro_aqui_abcdef123456
```

**Para generar un JWT_SECRET seguro**, puedes usar:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 5: Iniciar el Servidor

```bash
npm start
```

Deberías ver:
```
✓ Connected to PostgreSQL database
✓ Server running on port 3000
✓ Environment: development
```

### Paso 6: Actualizar el Frontend

Para usar el backend, necesitas actualizar los archivos HTML:

#### En `login.html`, cambia:
```html
<!-- De: -->
<script src="login.js"></script>

<!-- A: -->
<script src="api.js"></script>
<script src="login-backend.js"></script>
```

#### En `register.html`, cambia:
```html
<!-- De: -->
<script src="register.js"></script>

<!-- A: -->
<script src="api.js"></script>
<script src="register-backend.js"></script>
```

### Paso 7: Probar el Sistema

1. Abre http://localhost:3000 en tu navegador
2. Regístrate con un nuevo usuario
3. Inicia sesión
4. Las contraseñas ahora están hasheadas en la base de datos

## Verificar que las Contraseñas están Hasheadas

```bash
# Conectarse a la base de datos
psql -U postgres -d sobriety_app

# Ver los usuarios (verás que las contraseñas están hasheadas)
SELECT id, username, email, password_hash FROM users;
```

Deberías ver algo como:
```
 id | username |        email         |                      password_hash
----+----------+----------------------+--------------------------------------------------------
  1 | usuario1 | usuario@ejemplo.com  | $2b$10$abcdefghijklmnopqrstuvwxyz1234567890...
```

El `$2b$10$...` indica que está usando bcrypt con 10 rounds de salt.

## Migrar Datos Existentes

Si ya tienes usuarios en localStorage y quieres migrarlos:

1. Los usuarios existentes en localStorage **no** podrán iniciar sesión con el backend
2. Deberán registrarse nuevamente
3. Las contraseñas antiguas en localStorage no están hasheadas

**No es posible migrar las contraseñas** porque estaban guardadas en texto plano en localStorage.

## Troubleshooting

### Error: "role 'postgres' does not exist"
```bash
# Crear el rol postgres
createuser -s postgres
```

### Error: "FATAL: password authentication failed"
```bash
# Resetear contraseña de postgres
psql -U postgres
ALTER USER postgres PASSWORD 'nueva_contraseña';
```
Luego actualiza el `.env` con la nueva contraseña.

### Error: "Cannot find module 'pg'"
```bash
# Reinstalar dependencias
npm install
```

### El servidor no se conecta a la base de datos
- Verifica que PostgreSQL esté corriendo: `pg_ctl status`
- Verifica las credenciales en `.env`
- Verifica que la base de datos existe: `psql -U postgres -l`

## Archivos Importantes

- `server/server.js` - Servidor Express principal
- `server/auth.js` - Lógica de autenticación (bcrypt, JWT)
- `server/database.js` - Conexión a PostgreSQL
- `server/init-db.sql` - Script de creación de tablas
- `webapp/api.js` - Cliente API para el frontend
- `webapp/login-backend.js` - Login con backend
- `webapp/register-backend.js` - Registro con backend
- `.env` - Variables de entorno

## Seguridad Implementada

✅ **Bcrypt** - Contraseñas hasheadas con 10 salt rounds
✅ **JWT** - Tokens seguros con expiración de 7 días
✅ **Rate Limiting** - 5 intentos por minuto, bloqueo de 15 minutos
✅ **Validación de Inputs** - Express Validator
✅ **SQL Injection Protection** - Queries parametrizadas
✅ **CORS** - Configurado correctamente
✅ **Persistencia de Sesión** - Compatible con Android WebView

## Siguiente Paso Recomendado

Para producción, deberías:

1. Usar HTTPS (no HTTP)
2. Configurar variables de entorno de producción
3. Usar un servicio de base de datos en la nube (como AWS RDS, Heroku Postgres, etc.)
4. Implementar rate limiting con Redis
5. Agregar logs de auditoría
6. Configurar backup automático de la base de datos

¿Necesitas ayuda con algo más? Consulta `server/README.md` para documentación detallada de la API.
