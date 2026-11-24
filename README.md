
# Hospital API

API REST para la gestión de recursos hospitalarios, desarrollada con Node.js, Express, Sequelize y PostgreSQL.

El proyecto permite administrar usuarios, pacientes, médicos, enfermeros, especialidades y turnos médicos, aplicando validaciones, relaciones entre entidades, restricciones de integridad y manejo centralizado de errores.

Incluye documentación interactiva con Swagger UI, especificación OpenAPI, una colección de pruebas con Postman y una suite de 41 tests automatizados.

## 1. Tecnologías utilizadas

| Tecnología | Descripción |
|---|---|
| Node.js 26.x | Entorno de ejecución de JavaScript |
| Express 5 | Framework para desarrollar la API REST |
| PostgreSQL 16 | Base de datos relacional |
| Sequelize 6 | ORM para interactuar con PostgreSQL |
| Yup 1 | Validación de datos de entrada |
| bcrypt | Hash de contraseñas |
| Docker Compose | Gestión del contenedor de PostgreSQL |
| Swagger UI / OpenAPI | Documentación de la API |
| node:test | Framework de tests integrado en Node.js |
| Supertest | Pruebas HTTP automatizadas |

El proyecto utiliza **JavaScript con ES Modules**.

## 2. Arquitectura

La aplicación sigue una arquitectura en capas:

```text
HTTP Request
     |
     v
   Router
     |
     v
 Middleware
     |
     v
 Controller
     |
     v
 Sequelize Model
     |
     v
 PostgreSQL
```

Cada capa tiene una responsabilidad específica:

- **Routes:** definen los endpoints disponibles.
- **Middlewares:** validan datos, identificadores y errores.
- **Controllers:** gestionan las solicitudes y respuestas HTTP.
- **DTOs:** definen los datos permitidos de entrada y salida.
- **Models:** representan las entidades y sus relaciones.
- **Database:** configura Sequelize y la conexión a PostgreSQL.

Las respuestas exitosas utilizan, en general, la estructura:

```json
{
  "data": {}
}
```

Los errores siguen un formato consistente:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

Algunos errores de validación también incluyen un campo `details`.

## 3. Funcionalidades

### Usuarios

- Crear usuarios.
- Listar y consultar usuarios.
- Buscar usuarios por nombre o email.
- Actualizar y eliminar usuarios.
- Validar emails únicos.
- Almacenar contraseñas mediante hashes.
- Iniciar sesión con email y contraseña.
- Gestionar roles `ROLE_USER` y `ROLE_ADMIN`.
- Evitar exponer contraseñas y hashes en las respuestas.

### Pacientes

- Crear pacientes.
- Listar y consultar pacientes.
- Actualizar parcialmente sus datos.
- Eliminar pacientes sin turnos asociados.
- Validar documentos de identidad únicos.
- Validar fechas de nacimiento.
- Impedir la eliminación de pacientes que tengan turnos.

### Especialidades

- Registrar especialidades médicas.
- Consultar el catálogo de especialidades.
- Asociar médicos con especialidades.
- Mantener la integridad referencial entre médicos y especialidades.

### Médicos

- Crear médicos.
- Listar y consultar médicos.
- Asociarlos con una especialidad existente.
- Validar matrículas profesionales únicas.
- Devolver la especialidad como objeto anidado.
- Rechazar referencias a especialidades inexistentes.

### Enfermeros

- Crear enfermeros.
- Listar y consultar enfermeros.
- Validar matrículas profesionales únicas.
- Aplicar validaciones sobre los datos ingresados.

### Turnos médicos

- Crear turnos vinculados con pacientes y médicos.
- Consultar y listar turnos.
- Mostrar información anidada del médico y paciente.
- Filtrar turnos por médico, fecha, documento y nombre del paciente.
- Combinar diferentes criterios de búsqueda.
- Ordenar turnos por fecha ascendente.
- Evitar turnos duplicados para el mismo médico en el mismo horario.
- Cancelar turnos sin eliminarlos.
- Registrar la fecha de cancelación.
- Evitar cancelar dos veces el mismo turno.
- Eliminar turnos cuando corresponda.

## 4. Modelo de datos

El sistema contiene seis entidades principales:

| Entidad | Descripción |
|---|---|
| User | Usuarios del sistema |
| Patient | Información de pacientes |
| Specialty | Especialidades médicas |
| Doctor | Médicos registrados |
| Nurse | Enfermeros registrados |
| Appointment | Turnos médicos |

### Relaciones

**Specialty — Doctor (1:N)**

Una especialidad puede tener múltiples médicos, pero cada médico pertenece a una única especialidad.

**Patient — Appointment (1:N)**

Un paciente puede tener múltiples turnos, pero cada turno pertenece a un único paciente.

**Doctor — Appointment (1:N)**

Un médico puede atender múltiples turnos, pero cada turno está asignado a un único médico.

La relación entre pacientes y médicos es de muchos a muchos (**N:M**) a través de los turnos médicos.

### Restricciones de integridad

PostgreSQL controla restricciones como:

- Documento de paciente único.
- Matrícula profesional única.
- Email de usuario único.
- Especialidades obligatorias para médicos.
- Pacientes y médicos obligatorios para turnos.
- Horario único por médico para un mismo instante.
- Restricciones de eliminación entre entidades relacionadas.

### Tipos ENUM

El proyecto utiliza tipos ENUM nativos de PostgreSQL.

Roles de usuario:

```sql
CREATE TYPE user_role AS ENUM (
  'ROLE_USER',
  'ROLE_ADMIN'
);
```

Estados de turnos:

```sql
CREATE TYPE appointment_status AS ENUM (
  'SCHEDULED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW'
);
```

Los tipos deben existir antes de crear las tablas que los utilizan.

## 5. Requisitos previos

Para ejecutar el proyecto necesitás:

- Node.js 26.x.
- npm.
- Docker Desktop.
- Git.
- Un cliente de PostgreSQL opcional, como DBeaver, pgAdmin o TablePlus.

Verificá la instalación de Node.js y npm:

```bash
node --version
npm --version
```

Verificá Docker:

```bash
docker --version
docker compose version
```

## 6. Instalación

### Paso 1. Clonar el repositorio

```bash
git clone https://github.com/tomasfernanddez/Hospital-API
cd Hospital-API
```

### Paso 2. Instalar dependencias

```bash
npm install
```

### Paso 3. Configurar las variables de entorno

Creá el archivo `.env` a partir de `.env.example`:

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Bash:

```bash
cp .env.example .env
```

Configurá las variables de conexión:

```dotenv
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=nodepgdb
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_LOGGING=false
```

La contraseña debe coincidir con la configuración de PostgreSQL utilizada por Docker Compose.

El puerto `5433` se utiliza para evitar conflictos con otras instalaciones locales de PostgreSQL.

**Importante:** no subir `.env` ni contraseñas reales al repositorio.

### Paso 4. Levantar PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d --wait
```

Verificá el estado:

```bash
docker compose ps
```

PostgreSQL debe estar funcionando antes de iniciar la API.

### Paso 5. Preparar la base de datos

La base de desarrollo utiliza:

```text
DB_NAME=nodepgdb
```

Prepará el esquema mediante el mecanismo de inicialización del proyecto.

Si tenés configurado el script de reinicialización:

```bash
npm run db:reset
```

**Advertencia:** este comando puede eliminar y recrear tablas. Usalo únicamente en una base de desarrollo cuyos datos puedas descartar.

Los tipos ENUM `user_role` y `appointment_status` deben estar creados antes de sincronizar los modelos.

### Paso 6. Iniciar el servidor

En modo desarrollo:

```bash
npm run dev
```

En modo normal:

```bash
npm start
```

Con la configuración predeterminada, la API estará disponible en:

```text
http://localhost:3000
```

Verificá el endpoint:

```http
GET http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

## 7. Endpoints

La ruta base de la API es:

```text
http://localhost:3000/api
```

### Health

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Verificar el estado de la API |

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/users` | Listar usuarios |
| GET | `/users/search?keywords=` | Buscar usuarios |
| GET | `/users/:id` | Consultar usuario |
| POST | `/users` | Crear usuario |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |
| POST | `/auth/login` | Iniciar sesión |

### Especialidades

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/specialties` | Listar especialidades |
| GET | `/specialties/:id` | Consultar especialidad |
| POST | `/specialties` | Crear especialidad |

### Pacientes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/patients` | Listar pacientes |
| GET | `/patients/:id` | Consultar paciente |
| POST | `/patients` | Crear paciente |
| PATCH | `/patients/:id` | Actualizar paciente |
| DELETE | `/patients/:id` | Eliminar paciente |

### Médicos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/doctors` | Listar médicos |
| GET | `/doctors/:id` | Consultar médico |
| POST | `/doctors` | Crear médico |

### Enfermeros

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/nurses` | Listar enfermeros |
| GET | `/nurses/:id` | Consultar enfermero |
| POST | `/nurses` | Crear enfermero |

### Turnos médicos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/appointments` | Listar turnos |
| GET | `/appointments/search` | Buscar y filtrar turnos |
| GET | `/appointments/:id` | Consultar turno |
| POST | `/appointments` | Crear turno |
| PATCH | `/appointments/:id` | Actualizar estado |
| DELETE | `/appointments/:id` | Eliminar turno |

Los parámetros, esquemas de entrada, respuestas y códigos de error están detallados en la documentación OpenAPI.

## 8. Ejemplos de solicitudes

### Crear paciente

```http
POST /api/patients
Content-Type: application/json
```

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "documentNumber": "12345678",
  "birthDate": "1985-12-10"
}
```

Una creación exitosa devuelve HTTP `201 Created`.

### Crear médico

Primero debe existir una especialidad médica.

```http
POST /api/doctors
Content-Type: application/json
```

```json
{
  "firstName": "Gregory",
  "lastName": "House",
  "licenseNumber": "MN-12345678",
  "specialtyId": 1
}
```

El `specialtyId` debe corresponder a una especialidad existente.

### Crear turno médico

```http
POST /api/appointments
Content-Type: application/json
```

```json
{
  "patientId": 1,
  "doctorId": 1,
  "scheduledAt": "2026-12-10T14:30:00-03:00",
  "durationMinutes": 30,
  "reason": "Control general"
}
```

Los IDs deben corresponder a un paciente y un médico existentes.

### Buscar turnos

Por médico:

```http
GET /api/appointments/search?doctorId=1
```

Por fecha:

```http
GET /api/appointments/search?date=2026-12-10
```

Por documento:

```http
GET /api/appointments/search?documentNumber=12345678
```

Por nombre:

```http
GET /api/appointments/search?patientName=Ada
```

Con filtros combinados:

```http
GET /api/appointments/search?doctorId=1&date=2026-12-10
```

### Cancelar turno

```http
PATCH /api/appointments/1
Content-Type: application/json
```

```json
{
  "status": "CANCELLED"
}
```

La cancelación conserva el turno y registra `cancelledAt`.

Si se intenta cancelar nuevamente, la API responde con un conflicto.

## 9. Manejo de errores

La aplicación utiliza un middleware centralizado para transformar errores de validación, negocio y PostgreSQL en respuestas HTTP consistentes.

### Estructura

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

### Códigos principales

| HTTP | Código | Significado |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 400 | `INVALID_ID` | Identificador inválido |
| 400 | `INVALID_JSON` | JSON mal formado |
| 400 | `INVALID_REFERENCE` | Referencia a entidad inexistente |
| 401 | `INVALID_CREDENTIALS` | Credenciales incorrectas |
| 404 | `USER_NOT_FOUND` | Usuario inexistente |
| 404 | `PATIENT_NOT_FOUND` | Paciente inexistente |
| 404 | `ROUTE_NOT_FOUND` | Ruta inexistente |
| 409 | `EMAIL_TAKEN` | Email duplicado |
| 409 | `DOCUMENT_NUMBER_TAKEN` | Documento duplicado |
| 409 | `LICENSE_NUMBER_TAKEN` | Matrícula duplicada |
| 409 | `DOCTOR_SLOT_TAKEN` | Horario médico ocupado |
| 409 | `APPOINTMENT_ALREADY_CANCELLED` | Turno ya cancelado |
| 409 | `PATIENT_HAS_APPOINTMENTS` | Paciente con turnos asociados |
| 500 | `INTERNAL_ERROR` | Error interno inesperado |

## 10. Documentación OpenAPI y Swagger

El proyecto incluye documentación de los endpoints mediante OpenAPI.

### Swagger UI

Con el servidor en ejecución:

```text
http://localhost:3000/docs
```

Desde Swagger UI es posible consultar los endpoints, revisar los esquemas y ejecutar solicitudes HTTP.

### Especificación OpenAPI

```text
http://localhost:3000/openapi.yaml
```

Este endpoint entrega la especificación YAML de la API.

Dependiendo del navegador, el archivo puede mostrarse directamente o descargarse automáticamente. Ambos comportamientos son válidos.

## 11. Testing automatizado

El proyecto cuenta con **41 tests automatizados**, implementados con el framework nativo `node:test` y Supertest.

Los tests realizan solicitudes HTTP sobre la aplicación Express y utilizan una base PostgreSQL independiente.

### Base de datos de testing

Para evitar modificar los datos de desarrollo, las pruebas utilizan:

```text
hospital_test
```

Esta base es independiente de `nodepgdb`.

**Nunca ejecutar los tests contra la base de desarrollo o producción.**

### Crear la base de testing

Con PostgreSQL funcionando, creá la base si todavía no existe.

Por ejemplo:

```bash
docker exec -it nodepgdb psql -U postgres -d postgres
```

Dentro de PostgreSQL:

```sql
CREATE DATABASE hospital_test;
```

Si ya existe, no es necesario volver a crearla.

Salí de PostgreSQL con:

```text
\q
```

### Configurar `.env.test`

Creá un archivo `.env.test` en la raíz:

```dotenv
NODE_ENV=test

DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=hospital_test
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_LOGGING=false
```

Las credenciales y el puerto deben coincidir con tu instancia de PostgreSQL.

La configuración de tests verifica que:

- `NODE_ENV` sea `test`.
- `DB_NAME` sea `hospital_test`.
- Sequelize apunte a `hospital_test`.
- PostgreSQL confirme que la conexión activa utiliza `hospital_test`.

La preparación de pruebas puede eliminar y recrear las tablas de `hospital_test`.

### Ejecutar los tests

```bash
npm test
```

El script utiliza:

```bash
node --env-file=.env.test --test --test-concurrency=1
```

La concurrencia entre archivos está deshabilitada porque las suites comparten la base de testing.

### Organización

```text
tests/
├── setup.js
├── health.test.js
├── patients.test.js
├── doctors-nurses.test.js
├── appointments.test.js
└── users.test.js
```

`setup.js` contiene las funciones para:

- Verificar la base de testing.
- Crear los tipos ENUM necesarios.
- Sincronizar los modelos.
- Limpiar registros entre pruebas.
- Cerrar las conexiones a PostgreSQL.

### Cobertura de pruebas

| Módulo | Cantidad |
|---|---:|
| Health | 1 |
| Patients | 11 |
| Doctors y Nurses | 8 |
| Appointments | 15 |
| Users | 6 |
| **Total** | **41** |

Entre los escenarios verificados están:

- Creación y consulta de recursos.
- Validación de datos obligatorios.
- Rechazo de campos desconocidos.
- Detección de documentos, emails y matrículas duplicados.
- Validación de referencias inexistentes.
- Relaciones anidadas entre entidades.
- Restricciones de horarios médicos.
- Búsquedas por diferentes filtros.
- Cancelación de turnos.
- Restricciones al eliminar pacientes.
- Ordenamiento de resultados.
- Regresión de los endpoints de usuarios.
- Protección de contraseñas en respuestas HTTP.

### Resultado verificado

```text
tests 41
pass 41
fail 0
cancelled 0
```

### Repetibilidad

Para comprobar que la suite no depende de datos anteriores, ejecutala dos veces:

```bash
npm test
npm test
```

Ambas ejecuciones deben terminar exitosamente.

## 12. Pruebas con Postman

Además de los tests automatizados, el proyecto fue validado utilizando Postman.

La colección de la Clase 8 se ejecutó mediante Collection Runner con:

```text
75 requests
208 assertions aprobadas
0 assertions fallidas
```

Se verificaron operaciones CRUD, validaciones, manejo de errores, conflictos de integridad, filtros y relaciones entre recursos.

## 13. Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Iniciar servidor con recarga automática |
| `npm start` | Iniciar servidor normalmente |
| `npm test` | Ejecutar los 41 tests automatizados |
| `npm run db:reset` | Reinicializar esquema y datos de desarrollo, si está configurado |

**Precaución:** `db:reset` puede eliminar datos de la base configurada en el entorno. Verificá la conexión antes de ejecutarlo.

## 14. Estructura del proyecto

```text
Hospital-API/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.model.js
│   │   ├── specialty.model.js
│   │   ├── patient.model.js
│   │   ├── doctor.model.js
│   │   ├── nurse.model.js
│   │   └── appointment.model.js
│   ├── dtos/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── errors/
│   └── routes/
├── tests/
│   ├── setup.js
│   ├── health.test.js
│   ├── patients.test.js
│   ├── doctors-nurses.test.js
│   ├── appointments.test.js
│   └── users.test.js
├── .env
├── .env.test
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

La organización permite separar responsabilidades y facilita el mantenimiento y las pruebas.

## 15. Seguridad y buenas prácticas

El proyecto implementa distintas medidas:

- Validación de datos de entrada mediante Yup.
- DTOs para limitar los campos expuestos.
- Contraseñas almacenadas mediante hashes de bcrypt.
- Restricciones de integridad en PostgreSQL.
- Manejo centralizado de errores.
- Verificación de identificadores.
- Rechazo de referencias inválidas.
- Base independiente para testing.
- Variables sensibles fuera del control de versiones.

Los archivos `.env` y `.env.test` deben incluirse en `.gitignore`.

Se recomienda versionar únicamente archivos de ejemplo sin contraseñas reales.

El sistema implementa roles de usuario; sin embargo, los roles no deben interpretarse como un sistema completo de autorización hasta contar con controles de acceso en los endpoints.

## 16. Problemas frecuentes

### PostgreSQL no responde

Verificá que Docker Desktop esté abierto:

```bash
docker compose ps
```

Si el contenedor no está activo:

```bash
docker compose up -d --wait
```

### Error de autenticación

```text
password authentication failed
```

Verificá que `DB_USER` y `DB_PASSWORD` coincidan con las credenciales reales de PostgreSQL.

### Puerto ocupado

```text
port is already allocated
```

Comprobá si otra instancia de PostgreSQL está utilizando el mismo puerto y ajustá la configuración si es necesario.

### Falta la base de testing

```text
database "hospital_test" does not exist
```

Creá `hospital_test` antes de ejecutar `npm test`.

### Falta el tipo user_role

```text
type "user_role" does not exist
```

El modelo de usuarios necesita el tipo ENUM `user_role`.

En el entorno de testing, `tests/setup.js` prepara este tipo antes de sincronizar las tablas.

En desarrollo, debe existir antes de crear la tabla correspondiente.

### Falta el tipo appointment_status

```text
type "appointment_status" does not exist
```

Verificá que el tipo ENUM de estados de turnos esté creado antes de sincronizar el modelo Appointment.

### Tests cancelados

Si aparecen pruebas canceladas con:

```text
test did not finish before its parent and was cancelled
```

Revisá el error original del hook `before` o `beforeEach`.

Una falla durante la preparación de PostgreSQL puede impedir que las pruebas lleguen a ejecutarse.

### Swagger no carga

Verificá que la API esté iniciada:

```text
http://localhost:3000/api/health
```

Después revisá:

```text
http://localhost:3000/docs
```

### openapi.yaml se descarga

Es un comportamiento normal del navegador. El archivo YAML puede descargarse en lugar de mostrarse directamente.

## 17. Validación final del proyecto

El proyecto fue verificado mediante:

- Instalación de dependencias con npm.
- Ejecución de PostgreSQL mediante Docker.
- Inicialización del esquema de base de datos.
- Arranque de la API.
- Prueba del endpoint Health.
- Acceso a Swagger UI.
- Acceso a la especificación OpenAPI.
- Collection Runner de Postman.
- Suite de 41 tests automatizados.

## 18. Objetivo académico

Proyecto desarrollado como parte de la formación Full Stack Mentoring.

El objetivo es aplicar de manera práctica:

- Diseño y desarrollo de APIs REST.
- Arquitectura por capas.
- Persistencia con bases de datos relacionales.
- Modelado y asociaciones con Sequelize.
- Validación y transformación de datos.
- Manejo consistente de errores HTTP.
- Integridad referencial.
- Documentación de APIs.
- Testing manual y automatizado.
- Reproducibilidad del entorno de desarrollo.

El resultado es una API hospitalaria modular, documentada y probada, preparada para continuar incorporando nuevas funcionalidades.
