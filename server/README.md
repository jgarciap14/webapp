# Backend Setup - App Sobriedad

## Prerequisitos

1. **PostgreSQL** instalado y corriendo
2. **Node.js** v14 o superior

## Configuración de la Base de Datos

### 1. Crear la base de datos

```bash
# Conectarse a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE sobriety_app;

# Salir de psql
\q
```

### 2. Inicializar las tablas

```bash
# Ejecutar el script de inicialización
psql -U postgres -d sobriety_app -f server/init-db.sql
```

O manualmente:
```bash
psql -U postgres -d sobriety_app
```
Luego copiar y pegar el contenido de `init-db.sql`

### 3. Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sobriety_app
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgresql

JWT_SECRET=genera_un_secreto_seguro_aqui
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

**IMPORTANTE**: Cambia `DB_PASSWORD` y `JWT_SECRET` con valores seguros.

## Iniciar el Servidor

```bash
# Desde la raíz del proyecto
node server/server.js
```

El servidor estará corriendo en `http://localhost:3000`

## Endpoints de la API

### Autenticación

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "username": "usuario",
  "password": "contraseña123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña123"
}
```

Respuesta:
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario"
  }
}
```

### Endpoints Protegidos

Todos los siguientes endpoints requieren el header:
```
Authorization: Bearer <token>
```

#### Obtener perfil
```http
GET /api/user/profile
```

#### Obtener datos del usuario
```http
GET /api/user/data
```

#### Actualizar inspiración
```http
PUT /api/user/inspiration
Content-Type: application/json

{
  "inspiration": "Tu texto de inspiración"
}
```

#### Obtener recaídas
```http
GET /api/relapses
```

#### Registrar recaída
```http
POST /api/relapses
Content-Type: application/json

{
  "relapseDate": "2025-10-21T12:00:00Z",
  "notes": "Notas opcionales"
}
```

#### Obtener temas del foro
```http
GET /api/forum/topics
```

#### Crear tema en el foro
```http
POST /api/forum/topics
Content-Type: application/json

{
  "title": "Título del tema",
  "content": "Contenido del tema"
}
```

#### Obtener comentarios de un tema
```http
GET /api/forum/topics/:id/comments
```

#### Crear comentario
```http
POST /api/forum/topics/:id/comments
Content-Type: application/json

{
  "content": "Tu comentario"
}
```

## Seguridad Implementada

✅ **Bcrypt** - Contraseñas hasheadas con salt rounds = 10
✅ **JWT** - Tokens con expiración configurable
✅ **Rate Limiting** - 5 intentos por minuto, bloqueo de 15 minutos
✅ **Express Validator** - Validación de inputs
✅ **CORS** - Configurado para seguridad
✅ **SQL Injection Protection** - Queries parametrizadas

## Scripts útiles

### Agregar a package.json

```json
{
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js",
    "init-db": "psql -U postgres -d sobriety_app -f server/init-db.sql"
  }
}
```

Luego puedes usar:
```bash
npm start       # Iniciar servidor
npm run dev     # Desarrollo con auto-reload (requiere nodemon)
npm run init-db # Inicializar base de datos
```

## Troubleshooting

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo: `pg_ctl status`
- Verifica las credenciales en `.env`
- Verifica que la base de datos exista: `psql -U postgres -l`

### Error de JWT
- Verifica que `JWT_SECRET` esté configurado en `.env`
- El token expira según `JWT_EXPIRES_IN`

### Error de rate limiting
- Los datos se almacenan en memoria (se reinician al reiniciar el servidor)
- Para producción, considera usar Redis
