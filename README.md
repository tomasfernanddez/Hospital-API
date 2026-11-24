# 🏥 Hospital API

API REST para la gestión de recursos hospitalarios, desarrollada con **Node.js, Express, Sequelize y PostgreSQL**.

El proyecto permite administrar usuarios, pacientes, médicos, enfermeros, especialidades y turnos médicos, aplicando validaciones de datos, relaciones entre entidades, restricciones de integridad y manejo centralizado de errores.

Incluye documentación interactiva mediante **Swagger UI y OpenAPI**, pruebas con Postman y una suite de **41 tests automatizados**.

## 1. Tecnologías utilizadas

| Tecnología | Descripción |
|---|---|
| Node.js 26.x | Entorno de ejecución de JavaScript |
| Express 5 | Framework para desarrollar la API REST |
| PostgreSQL 16 | Base de datos relacional |
| Sequelize 6 | ORM para gestionar los modelos y sus relaciones |
| Yup 1 | Validación de datos de entrada |
| bcrypt 6 | Hash de contraseñas |
| Docker Compose | Administración de PostgreSQL mediante contenedores |
| Swagger UI / OpenAPI | Documentación de endpoints y contratos HTTP |
| node:test | Framework nativo de testing de Node.js |
| Supertest 7 | Pruebas HTTP automatizadas |
| CORS | Configuración de orígenes permitidos |
| dotenv | Administración de variables de entorno |

El proyecto utiliza **JavaScript con ES Modules**.

## 2. Arquitectura

La aplicación sigue una arquitectura por capas:

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

Cada capa cumple una responsabilidad específica:

- **Routes:** definen las rutas y los métodos HTTP.
- **Middlewares:** validan las solicitudes, procesan identificadores y gestionan errores.
- **Controllers:** coordinan las operaciones y construyen las respuestas HTTP.
- **DTOs:** definen los datos de entrada permitidos y los campos expuestos.
- **Models:** representan las entidades del sistema y sus asociaciones.
- **Database:** configura la conexión con PostgreSQL mediante Sequelize.

### Formato de respuestas

Las respuestas exitosas que devuelven recursos utilizan el formato:

```json
{
  "data": {
    "id": 1
  }
}
```

Las operaciones de eliminación exitosas devuelven HTTP `204 No Content`.

Los errores utilizan una estructura consistente:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

Los errores de validación también pueden incluir un arreglo `details`.

## 3. Funcionalidades

### Usuarios

- Crear, listar, consultar, actualizar y eliminar usuarios.
- Buscar usuarios por nombre o email.
- Validar emails únicos.
- Almacenar contraseñas hasheadas mediante bcrypt.
- Iniciar sesión utilizando email y contraseña.
- Gestionar los roles `ROLE_USER` y `ROLE_ADMIN`.
- Evitar exponer contraseñas y hashes en las respuestas.

### Pacientes

- Registrar pacientes.
- Consultar pacientes por identificador.
- Listar pacientes ordenados por ID.
- Actualizar parcialmente sus datos.
- Validar documentos de identidad únicos.
- Validar fechas de nacimiento.
- Eliminar pacientes sin turnos asociados.
- Impedir la eliminación de pacientes que tengan turnos registrados.

### Especialidades

- Registrar especialidades médicas.
- Consultar el catálogo de especialidades.
- Asociar médicos con especialidades.
- Mantener la integridad referencial entre especialidades y médicos.

### Médicos

- Registrar médicos.
- Consultar y listar médicos.
- Asociar cada médico con una especialidad existente.
- Validar matrículas profesionales únicas.
- Devolver información anidada de la especialidad.
- Rechazar especialidades inexistentes.

### Enfermeros

- Registrar enfermeros.
- Consultar y listar enfermeros.
- Validar matrículas profesionales únicas.
- Rechazar datos incompletos o inválidos.

### Turnos médicos

- Crear turnos vinculados con pacientes y médicos.
- Consultar, listar y eliminar turnos.
- Mostrar información anidada de pacientes y médicos.
- Filtrar por médico, fecha, documento y nombre del paciente.
- Combinar múltiples criterios de búsqueda.
- Ordenar turnos por fecha ascendente.
- Evitar que un médico tenga dos turnos a la misma hora exacta.
- Cancelar turnos sin eliminarlos.
- Registrar automáticamente la fecha de cancelación.
- Impedir cancelar dos veces el mismo turno.

## 4. Modelo de datos

El sistema está compuesto por seis entidades principales:

| Entidad | Descripción |
|---|---|
| `User` | Usuarios del sistema |
| `Patient` | Pacientes del hospital |
| `Specialty` | Especialidades médicas |
| `Doctor` | Médicos registrados |
| `Nurse` | Enfermeros registrados |
| `Appointment` | Turnos médicos |

### Relaciones

**Specialty — Doctor (1:N)**

Una especialidad puede tener múltiples médicos, mientras que cada médico pertenece a una única especialidad.

**Patient — Appointment (1:N)**

Un paciente puede tener múltiples turnos, pero cada turno pertenece a un único paciente.

**Doctor — Appointment (1:N)**

Un médico puede atender múltiples turnos, pero cada turno está asignado a un único médico.

**Patient — Doctor (N:M)**

La relación entre pacientes y médicos se resuelve mediante `Appointment`, una entidad intermedia que almacena información propia del turno.

Los modelos `User` y `Nurse` son independientes de estas asociaciones en el MVP.

### Restricciones de integridad

PostgreSQL garantiza:

- Email único para usuarios.
- Documento único para pacientes.
- Matrícula única para médicos y enfermeros.
- Especialidades válidas para médicos.
- Pacientes y médicos existentes para cada turno.
- Horario único por médico mediante la combinación `doctor_id` y `scheduled_at`.
- Restricciones de eliminación para entidades relacionadas.

La restricción de horarios impide dos turnos exactamente a la misma hora, pero no detecta por sí sola todos los posibles solapamientos entre intervalos.

### Tipos ENUM

El proyecto utiliza tipos ENUM nativos de PostgreSQL.

**Roles de usuario:**

```sql
CREATE TYPE user_role AS ENUM (
  'ROLE_USER',
  'ROLE_ADMIN'
);
```

**Estados de turnos:**

```sql
CREATE TYPE appointment_status AS ENUM (
  'SCHEDULED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW'
);
```

Ambos tipos se preparan durante la sincronización del esquema.

## 5. Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js 26.x
- npm
- Git
- Docker Desktop

Opcionalmente, se puede utilizar un cliente SQL como DBeaver, TablePlus o pgAdmin.

Verificar las herramientas instaladas:

```bash
node --version
npm --version
docker --version
docker compose version
```

## 6. Instalación y configuración

### Paso 1. Clonar el repositorio

```bash
git clone https://github.com/tomasfernanddez/Hospital-API.git
cd Hospital-API
```

### Paso 2. Instalar dependencias

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`.

### Paso 3. Configurar las variables de entorno

Crear un archivo `.env` a partir de `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Bash:

```bash
cp .env.example .env
```

Configurar las variables:

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

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde se ejecuta la API |
| `CORS_ORIGIN` | Orígenes permitidos para las solicitudes HTTP |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `DB_LOGGING` | Habilita o deshabilita los logs SQL |

El puerto `5433` permite evitar conflictos con una instalación local de PostgreSQL que utilice `5432`.

**Importante:** las credenciales de `.env` deben coincidir con la configuración de PostgreSQL utilizada por Docker Compose.

No subir `.env` al repositorio.

### Paso 4. Levantar PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d --wait
```

Verificar el estado del contenedor:

```bash
docker compose ps
```

La base de datos debe estar disponible antes de ejecutar los scripts de inicialización.

Los datos persistidos en `./postgres/` sobreviven a la detención normal del contenedor.

No utilizar `docker compose down -v` si se desea conservar los datos de PostgreSQL.

### Paso 5. Sincronizar el esquema

```bash
npm run db:sync
```

Este comando ejecuta:

```bash
node scripts/db-sync.js
```

El script:

1. Prepara el ENUM `user_role`, si no existe.
2. Prepara el ENUM `appointment_status`, si no existe.
3. Importa los modelos y sus asociaciones.
4. Sincroniza las tablas mediante Sequelize.
5. Cierra la conexión a PostgreSQL.

### Paso 6. Cargar los datos iniciales

```bash
npm run db:seed
```

Este comando ejecuta:

```bash
node scripts/db-seed.js
```

Carga las siguientes especialidades:

| ID | Especialidad |
|---|---|
| Generado por PostgreSQL | Cardiología |
| Generado por PostgreSQL | Pediatría |
| Generado por PostgreSQL | Clínica médica |
| Generado por PostgreSQL | Diagnóstico clínico |
| Generado por PostgreSQL | Traumatología |

El script utiliza `ignoreDuplicates: true` para evitar repetir especialidades ya registradas, apoyándose en la restricción de unicidad de la base.

### Reinicialización opcional

También existe el comando:

```bash
npm run db:reset
```

Este script ejecuta:

```bash
node scripts/db-sync.js --force && node scripts/db-seed.js
```

**Advertencia:** `--force` elimina y recrea las tablas sincronizadas, lo que provoca la pérdida de sus datos.

Utilizarlo únicamente en una base de desarrollo cuyos datos puedan descartarse. No ejecutarlo en producción.

### Paso 7. Iniciar la API

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Con la configuración predeterminada, el servidor estará disponible en:

```text
http://localhost:3000
```

Verificar su funcionamiento:

```http
GET http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

## 7. Endpoints de la API

La URL base es:

```text
http://localhost:3000/api
```

### Health

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Verificar el funcionamiento de la API |

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
| POST | `/specialties` | Registrar especialidad |

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
| POST | `/doctors` | Registrar médico |

### Enfermeros

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/nurses` | Listar enfermeros |
| GET | `/nurses/:id` | Consultar enfermero |
| POST | `/nurses` | Registrar enfermero |

### Turnos médicos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/appointments` | Listar turnos |
| GET | `/appointments/search` | Buscar y filtrar turnos |
| GET | `/appointments/:id` | Consultar turno |
| POST | `/appointments` | Crear turno |
| PATCH | `/appointments/:id` | Actualizar estado del turno |
| DELETE | `/appointments/:id` | Eliminar turno |

Para conocer los parámetros, esquemas y respuestas detalladas, consultar la documentación OpenAPI.

## 8. Ejemplos de solicitudes

### Crear un paciente

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

La API devuelve HTTP `201 Created` y los datos del paciente creado.

### Registrar un médico

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

La especialidad debe existir previamente.

### Crear un turno médico

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

El paciente y el médico deben existir.

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

Por nombre del paciente:

```http
GET /api/appointments/search?patientName=Ada
```

Con filtros combinados:

```http
GET /api/appointments/search?doctorId=1&date=2026-12-10
```

Los filtros pueden combinarse para obtener resultados que cumplan todas las condiciones.

### Cancelar un turno

```http
PATCH /api/appointments/1
Content-Type: application/json
```

```json
{
  "status": "CANCELLED"
}
```

La API conserva el turno y registra la fecha de cancelación en `cancelledAt`.

Si el turno ya está cancelado, devuelve HTTP `409 Conflict`.

## 9. Manejo de errores

La aplicación utiliza un middleware centralizado para traducir errores de validación, negocio y base de datos en respuestas HTTP.

### Ejemplo

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

### Principales códigos de error

| HTTP | Código | Descripción |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Datos inválidos |
| 400 | `INVALID_ID` | Identificador inválido |
| 400 | `INVALID_JSON` | JSON mal formado |
| 400 | `INVALID_REFERENCE` | Referencia inexistente |
| 401 | `INVALID_CREDENTIALS` | Credenciales incorrectas |
| 404 | `USER_NOT_FOUND` | Usuario inexistente |
| 404 | `PATIENT_NOT_FOUND` | Paciente inexistente |
| 404 | `ROUTE_NOT_FOUND` | Ruta inexistente |
| 409 | `EMAIL_TAKEN` | Email duplicado |
| 409 | `DOCUMENT_NUMBER_TAKEN` | Documento duplicado |
| 409 | `LICENSE_NUMBER_TAKEN` | Matrícula duplicada |
| 409 | `SPECIALTY_NAME_TAKEN` | Especialidad duplicada |
| 409 | `DOCTOR_SLOT_TAKEN` | Horario médico ocupado |
| 409 | `APPOINTMENT_ALREADY_CANCELLED` | Turno ya cancelado |
| 409 | `PATIENT_HAS_APPOINTMENTS` | Paciente con turnos asociados |
| 500 | `INTERNAL_ERROR` | Error interno inesperado |

## 10. Documentación Swagger y OpenAPI

El proyecto incluye documentación de la API mediante OpenAPI.

### Swagger UI

Con el servidor iniciado:

```text
http://localhost:3000/docs
```

Desde Swagger UI se pueden:

- Consultar endpoints.
- Revisar parámetros.
- Inspeccionar esquemas de datos.
- Consultar códigos de respuesta.
- Ejecutar solicitudes HTTP.

### Archivo OpenAPI

```text
http://localhost:3000/openapi.yaml
```

Este endpoint devuelve la especificación YAML de la API.

Dependiendo del navegador, el archivo puede visualizarse directamente o descargarse. Ambos comportamientos son normales.

## 11. Tests automatizados

El proyecto cuenta con **41 tests automatizados**, desarrollados mediante `node:test` y Supertest.

Las pruebas realizan solicitudes HTTP directamente sobre Express y verifican el comportamiento real de la API utilizando PostgreSQL.

### Base de testing

Se utiliza una base independiente:

```text
hospital_test
```

La base de desarrollo continúa siendo:

```text
nodepgdb
```

Esta separación evita que los tests modifiquen los registros de desarrollo.

### Crear la base de testing

Con PostgreSQL iniciado:

```bash
docker exec -it nodepgdb psql -U postgres -d postgres
```

Dentro de PostgreSQL:

```sql
CREATE DATABASE hospital_test;
```

Si ya existe, no es necesario crearla nuevamente.

Para salir:

```text
\q
```

### Configurar `.env.test`

Crear un archivo `.env.test` en la raíz del proyecto:

```dotenv
NODE_ENV=test

DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=hospital_test
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_LOGGING=false
```

Adaptar las credenciales y el puerto a la instancia de PostgreSQL utilizada.

**Importante:** este archivo debe estar incluido en `.gitignore`.

### Protección de la base de testing

Antes de modificar las tablas, la configuración comprueba:

1. Que `NODE_ENV` sea `test`.
2. Que `DB_NAME` sea `hospital_test`.
3. Que Sequelize esté configurado para `hospital_test`.
4. Que PostgreSQL confirme que la base activa es `hospital_test`.

La inicialización utiliza:

```javascript
sequelize.sync({ force: true });
```

Por esta razón, los datos existentes en `hospital_test` se eliminan al preparar las pruebas.

**Nunca ejecutar estos tests contra una base de desarrollo o producción.**

### Ejecutar los tests

```bash
npm test
```

El comando configurado en `package.json` es:

```bash
node --env-file=.env.test --test --test-concurrency=1
```

La opción `--test-concurrency=1` evita que diferentes archivos de prueba preparen simultáneamente la misma base.

### Organización de los tests

```text
tests/
├── setup.js
├── health.test.js
├── patients.test.js
├── doctors-nurses.test.js
├── appointments.test.js
└── users.test.js
```

El archivo `tests/setup.js` permite:

- Validar la conexión a `hospital_test`.
- Crear los tipos ENUM necesarios.
- Sincronizar los modelos.
- Limpiar registros entre pruebas.
- Cerrar correctamente las conexiones.

### Cobertura de pruebas

| Módulo | Tests |
|---|---:|
| Health | 1 |
| Patients | 11 |
| Doctors y Nurses | 8 |
| Appointments | 15 |
| Users | 6 |
| **Total** | **41** |

### Escenarios verificados

Los tests cubren:

- Creación y consulta de entidades.
- Validación de datos obligatorios.
- Rechazo de campos desconocidos.
- Validación de identificadores.
- Documentos duplicados.
- Emails duplicados.
- Matrículas duplicadas.
- Referencias inexistentes.
- Relaciones entre pacientes, médicos y especialidades.
- Restricciones de horarios médicos.
- Filtros de búsqueda.
- Ordenamiento por fecha.
- Cancelación de turnos.
- Prevención de cancelaciones duplicadas.
- Eliminación de recursos.
- Restricciones de integridad referencial.
- Regresión de funcionalidades de usuarios.
- Protección de contraseñas en respuestas.

### Resultado verificado

```text
tests 41
pass 41
fail 0
cancelled 0
```

### Repetibilidad

Para comprobar que las pruebas no dependen de datos previos:

```bash
npm test
npm test
```

Ambas ejecuciones deben finalizar correctamente.

## 12. Pruebas con Postman

Además de los tests automatizados, la API fue validada con Postman Collection Runner.

### Resultado obtenido

| Métrica | Resultado |
|---|---:|
| Requests ejecutadas | 75 |
| Assertions aprobadas | 208 |
| Assertions fallidas | 0 |

Las pruebas incluyeron:

- Operaciones CRUD.
- Validaciones de entrada.
- Manejo de errores HTTP.
- Restricciones de integridad.
- Conflictos de unicidad.
- Relaciones entre entidades.
- Búsquedas con filtros.
- Cancelaciones de turnos.

## 13. Scripts del proyecto

Los scripts definidos en `package.json` son:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con recarga automática |
| `npm start` | Inicia el servidor sin recarga automática |
| `npm run db:sync` | Sincroniza los modelos con PostgreSQL |
| `npm run db:seed` | Carga las especialidades iniciales |
| `npm run db:reset` | Recrea el esquema y carga los datos iniciales |
| `npm test` | Ejecuta los 41 tests automatizados |

### Scripts de base de datos

**Sincronización:**

```bash
npm run db:sync
```

**Carga inicial:**

```bash
npm run db:seed
```

**Reinicialización destructiva:**

```bash
npm run db:reset
```

El último comando utiliza `--force` y elimina los registros de las tablas sincronizadas.

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
│   ├── middlewares/
│   ├── errors/
│   └── routes/
├── scripts/
│   ├── db-sync.js
│   └── db-seed.js
├── tests/
│   ├── setup.js
│   ├── health.test.js
│   ├── patients.test.js
│   ├── doctors-nurses.test.js
│   ├── appointments.test.js
│   └── users.test.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

Los archivos `.env` y `.env.test` se mantienen localmente y no deben incluirse en el repositorio.

## 15. Seguridad y buenas prácticas

El proyecto incorpora distintas prácticas:

- Validación de entrada mediante Yup.
- Separación de responsabilidades por capas.
- Uso de DTOs para controlar los datos expuestos.
- Hash de contraseñas mediante bcrypt.
- Restricciones de unicidad en PostgreSQL.
- Relaciones con integridad referencial.
- Manejo centralizado de errores.
- Validación de identificadores y referencias.
- Aislamiento de la base de testing.
- Variables sensibles fuera del control de versiones.

### Consideración sobre los roles

El proyecto incluye `ROLE_USER` y `ROLE_ADMIN` como parte del modelo de usuarios.

La existencia de roles no implica, por sí sola, que se haya implementado un sistema completo de autenticación y autorización.

El control integral de permisos y acceso a endpoints puede ampliarse en futuras versiones.

### Consideración sobre los turnos

La restricción `UNIQUE (doctor_id, scheduled_at)` impide que un médico tenga dos turnos a la misma hora exacta.

No garantiza por sí sola la ausencia de intervalos superpuestos, por ejemplo, turnos de 30 minutos a las 14:00 y 14:15.

Esta validación constituye una posible mejora futura.

## 16. Problemas frecuentes

### PostgreSQL no responde

Verificar el estado del contenedor:

```bash
docker compose ps
```

Iniciarlo si es necesario:

```bash
docker compose up -d --wait
```

### Error de autenticación

```text
password authentication failed
```

Verificar que las credenciales de `.env` coincidan con las configuradas en PostgreSQL.

Si el contenedor ya tenía un volumen inicializado, cambiar `DB_PASSWORD` en `.env` no modifica automáticamente la contraseña almacenada por PostgreSQL.

### Puerto ocupado

```text
port is already allocated
```

Verificar si otro servicio está utilizando el puerto configurado.

### Base de testing inexistente

```text
database "hospital_test" does not exist
```

Crear la base `hospital_test` antes de ejecutar `npm test`.

### Tipo ENUM inexistente

```text
type "user_role" does not exist
```

O:

```text
type "appointment_status" does not exist
```

Verificar que el script de sincronización haya preparado los tipos ENUM antes de crear las tablas.

### Tabla inexistente

```text
relation "patients" does not exist
```

Ejecutar:

```bash
npm run db:sync
```

### Tests cancelados

```text
test did not finish before its parent and was cancelled
```

Revisar el error original del hook `before` o `beforeEach`.

Una falla al preparar la base puede provocar la cancelación de las pruebas dependientes.

### Swagger no carga

Comprobar primero que la API responda:

```text
http://localhost:3000/api/health
```

Después acceder a:

```text
http://localhost:3000/docs
```

### openapi.yaml se descarga

El navegador puede descargar el archivo YAML en lugar de mostrarlo directamente.

Esto es normal siempre que el archivo entregado contenga la especificación OpenAPI.

## 17. Verificación final

Se verificó el funcionamiento del proyecto mediante:

- Instalación de dependencias con npm.
- Levantamiento de PostgreSQL mediante Docker Compose.
- Sincronización de modelos con `npm run db:sync`.
- Carga inicial de especialidades con `npm run db:seed`.
- Inicio del servidor Express.
- Consulta de `/api/health`.
- Acceso a Swagger UI.
- Entrega del archivo OpenAPI.
- Ejecución de la colección de Postman con 208 assertions aprobadas.
- Ejecución de la suite de 41 tests automatizados.

## 18. Objetivo académico

Proyecto desarrollado como parte de **Full Stack Mentoring**, integrando los conocimientos adquiridos durante las Clases 7 y 8.

Se aplicaron conceptos de:

- Desarrollo de APIs REST.
- Arquitectura por capas.
- Persistencia de datos con PostgreSQL.
- Modelado de entidades y relaciones.
- Sequelize como ORM.
- Validación mediante DTOs.
- Manejo de errores HTTP.
- Integridad referencial.
- Documentación OpenAPI.
- Pruebas manuales con Postman.
- Testing automatizado con Node.js y Supertest.
- Configuración de entornos reproducibles.

El resultado es una **API hospitalaria modular, documentada y probada**, preparada para incorporar nuevas funcionalidades en futuras etapas de desarrollo.