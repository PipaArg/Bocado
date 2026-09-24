# Bocado
Gestor de restaurantes

Trabajo Practico Integrador - Aplicaciones Interactivas

![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?logo=apachemaven&logoColor=white)
![Status](https://img.shields.io/badge/Estado-En%20desarrollo-yellow)

</div>

---

## 🎓 Carátula

| | |
|---|---|
| **Universidad** | UADE |
| **Materia** | Aplicaciones Interactivas |
| **Profesor/a** | Juan Ignacio Lopez y Luciano Pueyo|
| **Cuatrimestre / Año** | 2do Cuatrimestre - 2026 |


### 👥 Integrantes

| Legajo | Apellido y Nombre |
|--------|-------------------|
| [12345] | Gonzalo Eseiza |
| [12346] | Joaquin Lardizabal |
| [12347] | Macarena Molina |
| [12347] | Alexis Gandara|
| [12347] | Nicolas Piquero |



---

## 📋 Descripción



## 🛠️ Tecnologías utilizadas

- **Lenguaje:** Java v25 o superior
- **Framework:** Spring Boot 
- **Build tool:** Maven 
- **Base de datos:** 
- **Documentación API:** Swagger
- **Control de versiones:**  GitHub

## 📂 Estructura del proyecto

```
src/
├── main/
│   ├── java/
│   │   └── com/bocado/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── model/
│   │       └── dto/
│   └── resources/
│       └── application.properties
└── test/
    └── java/
```

## ⚙️ Requisitos previos

- Java JDK 25 o superior
- Maven 
- MySQL instalado y corriendo 

## 🚀 Instalación y ejecución


1. Configurar la base de datos en `src/main/resources/application.properties`
   ```properties
   spring.application.name=bocado
    spring.datasource.url=jdbc:mysql://localhost:3306/Bocado
    spring.datasource.username=root
    spring.datasource.password=CONTRASENA CONFIGURADA EN MYSQL
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.format_sql=true
   ```

2. Compilar y ejecutar
   ```bash
   ./mvnw spring-boot:run
   ```

4. La aplicación quedará disponible para ejecutar en postman en:
   ```
   http://localhost:8080
   ```

## 📖 Documentación de la API

Todas las peticiones y respuestas usan `Content-Type: application/json`.

**Formatos de datos**

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Fecha | `yyyy-MM-dd` | `"2026-10-15"` |
| Hora | `HH:mm` o `HH:mm:ss` | `"21:00"` |
| Fecha y hora | ISO-8601 | `"2026-09-24T18:30:12"` |
| Importes | Número decimal | `8500.00` |

**Enums**

| Enum | Valores |
|------|---------|
| `EstadoTurno` | `PENDIENTE`, `CONFIRMADO`, `CANCELADO` |
| `EstadoPago` | `PENDIENTE`, `APROBADO`, `RECHAZADO` |

---

## 📌 Resumen de endpoints

### Clientes — `/api/clientes`

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| `POST` | `/api/clientes/crearCliente` | Crea un cliente | `201 Created` |
| `GET` | `/api/clientes/listarClientes` | Lista todos los clientes | `200 OK` |
| `GET` | `/api/clientes/obtenerCliente/{id}` | Obtiene un cliente por ID | `200 OK` |

### Platos — `/api/platos`

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| `POST` | `/api/platos/hamburguesas` | Crea una hamburguesa | `201 Created` |
| `POST` | `/api/platos/pizzas` | Crea una pizza | `201 Created` |
| `POST` | `/api/platos/milanesas` | Crea una milanesa | `201 Created` |
| `GET` | `/api/platos/listarPlatos` | Lista todos los platos | `200 OK` |

### Turnos — `/api/turnos`

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| `POST` | `/api/turnos/crearTurno` | Crea un turno en estado `PENDIENTE` | `201 Created` |
| `GET` | `/api/turnos/listarTurnos` | Lista todos los turnos | `200 OK` |
| `GET` | `/api/turnos/obtenerTurno/{id}` | Obtiene un turno por ID | `200 OK` |
| `PUT` | `/api/turnos/actualizarTurno/{id}` | Actualiza los datos de un turno | `200 OK` |
| `PUT` | `/api/turnos/cambiarEstado/{id}?estado=` | Cambia el estado de un turno | `200 OK` |
| `DELETE` | `/api/turnos/eliminarTurno/{id}` | Elimina un turno | `204 No Content` |
| `POST` | `/api/turnos/{turnoId}/platos/{platoId}` | Agrega un plato pre-pedido al turno | `200 OK` |
| `POST` | `/api/turnos/{turnoId}/pago` | Crea y asocia un pago al turno | `200 OK` |

---

## 👤 Clientes

### `POST /api/clientes/crearCliente`

Crea un nuevo cliente.

**Body**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `nombre` | String | Sí | No puede estar vacío |
| `apellido` | String | Sí | No puede estar vacío |
| `email` | String | Sí | No vacío y con formato de email válido |
| `telefono` | String | No | — |

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@mail.com",
  "telefono": "1134567890"
}
```

**Respuesta `201 Created`**

```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@mail.com",
  "telefono": "1134567890"
}
```

**Errores:** `400` si algún campo no cumple las validaciones.

### `GET /api/clientes/listarClientes`

Devuelve un array con todos los clientes (mismo formato que la respuesta anterior). Si no hay clientes devuelve `[]`.

### `GET /api/clientes/obtenerCliente/{id}`

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | Long | Path | ID del cliente |

**Respuesta `200 OK`:** el cliente, con el mismo formato que al crearlo.

**Errores:** `404` si no existe un cliente con ese ID.

---

## 🍔 Platos

Todos los platos comparten estos campos base, heredados de `Plato`:

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `nombre` | String | Sí | No vacío. **Único** (sin distinguir mayúsculas/minúsculas) |
| `descripcion` | String | Sí | No vacío |
| `precio` | Decimal | Sí | Mayor a 0 |

Cada tipo de plato agrega sus propios atributos, que en la respuesta se devuelven dentro del objeto `atributos`. El campo `tipo` indica la clase concreta (`Hamburguesa`, `Pizza` o `Milanesa`).

### `POST /api/platos/hamburguesas`

| Campo adicional | Tipo | Requerido |
|-----------------|------|-----------|
| `conQueso` | Boolean | Sí |
| `tipoPan` | String | Sí |

```json
{
  "nombre": "Hamburguesa Clásica",
  "descripcion": "Medallón de carne, lechuga y tomate",
  "precio": 8500.00,
  "conQueso": true,
  "tipoPan": "Brioche"
}
```

**Respuesta `201 Created`**

```json
{
  "id": 1,
  "nombre": "Hamburguesa Clásica",
  "descripcion": "Medallón de carne, lechuga y tomate",
  "precio": 8500.00,
  "tipo": "Hamburguesa",
  "atributos": {
    "conQueso": true,
    "tipoPan": "Brioche"
  }
}
```

### `POST /api/platos/pizzas`

| Campo adicional | Tipo | Requerido |
|-----------------|------|-----------|
| `tamanio` | String | Sí |
| `tipoMasa` | String | Sí |

```json
{
  "nombre": "Pizza Muzzarella",
  "descripcion": "Salsa de tomate, muzzarella y aceitunas",
  "precio": 12000.00,
  "tamanio": "Grande",
  "tipoMasa": "Media masa"
}
```

**Respuesta `201 Created`:** mismo formato, con `"tipo": "Pizza"` y `atributos` = `{ "tamanio", "tipoMasa" }`.

### `POST /api/platos/milanesas`

| Campo adicional | Tipo | Requerido |
|-----------------|------|-----------|
| `tipoCarne` | String | Sí |
| `guarnicion` | String | Sí |

```json
{
  "nombre": "Milanesa Napolitana",
  "descripcion": "Con jamón, salsa y muzzarella",
  "precio": 11000.00,
  "tipoCarne": "Ternera",
  "guarnicion": "Papas fritas"
}
```

**Respuesta `201 Created`:** mismo formato, con `"tipo": "Milanesa"` y `atributos` = `{ "tipoCarne", "guarnicion" }`.

**Errores de los tres endpoints de creación:**
- `400` si algún campo no cumple las validaciones.
- `409` si ya existe un plato con el mismo nombre.

### `GET /api/platos/listarPlatos`

Devuelve un array con todos los platos de todos los tipos, cada uno con su `tipo` y sus `atributos` específicos.

---

## 📅 Turnos

### Formato de respuesta de un turno

Todos los endpoints de turnos (salvo `DELETE`) devuelven este objeto:

```json
{
  "id": 1,
  "fecha": "2026-10-15",
  "hora": "21:00:00",
  "cantidadComensales": 4,
  "estado": "PENDIENTE",
  "clienteId": 1,
  "clienteNombre": "Juan Pérez",
  "platos": [
    {
      "id": 1,
      "nombre": "Hamburguesa Clásica",
      "descripcion": "Medallón de carne, lechuga y tomate",
      "precio": 8500.00,
      "tipo": "Hamburguesa",
      "atributos": { "conQueso": true, "tipoPan": "Brioche" }
    }
  ],
  "pago": {
    "id": 1,
    "monto": 34000.00,
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-09-24T18:30:12.345"
  }
}
```

`platos` es una lista vacía si no se pre-pidió nada, y `pago` es `null` si todavía no se asoció un pago.

### `POST /api/turnos/crearTurno`

Crea un turno para un cliente existente. El estado inicial siempre es `PENDIENTE`.

**Body**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `fecha` | Date | Sí | Formato `yyyy-MM-dd` |
| `hora` | Time | Sí | Formato `HH:mm` |
| `cantidadComensales` | Integer | Sí | Mínimo 1 |
| `clienteId` | Long | Sí | Positivo; el cliente debe existir |

```json
{
  "fecha": "2026-10-15",
  "hora": "21:00",
  "cantidadComensales": 4,
  "clienteId": 1
}
```

**Respuesta `201 Created`:** el turno creado.

**Errores:**
- `400` si algún campo no cumple las validaciones o el JSON tiene un formato inválido (por ejemplo, una fecha mal escrita).
- `404` si no existe el cliente indicado.

### `GET /api/turnos/listarTurnos`

Devuelve un array con todos los turnos.

### `GET /api/turnos/obtenerTurno/{id}`

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | Long | Path | ID del turno |

**Errores:** `404` si el turno no existe.

### `PUT /api/turnos/actualizarTurno/{id}`

Reemplaza fecha, hora, cantidad de comensales y cliente del turno. No modifica el estado, los platos ni el pago.

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | Long | Path | ID del turno |

**Body:** el mismo que en `crearTurno` (todos los campos son obligatorios).

**Errores:**
- `400` si el body no cumple las validaciones.
- `404` si no existe el turno o el cliente.

### `PUT /api/turnos/cambiarEstado/{id}`

Cambia el estado de un turno.

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | Long | Path | ID del turno |
| `estado` | EstadoTurno | Query | `PENDIENTE`, `CONFIRMADO` o `CANCELADO` |

**Ejemplo**

```
PUT /api/turnos/cambiarEstado/1?estado=CONFIRMADO
```

**Errores:**
- `400` si falta el parámetro `estado` o su valor no es válido.
- `404` si el turno no existe.

### `DELETE /api/turnos/eliminarTurno/{id}`

Elimina un turno.

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | Long | Path | ID del turno |

**Respuesta:** `204 No Content` (sin body).

**Errores:** `404` si el turno no existe.

### `POST /api/turnos/{turnoId}/platos/{platoId}`

Agrega un plato existente como pre-pedido del turno (relación muchos a muchos). No requiere body.

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `turnoId` | Long | Path | ID del turno |
| `platoId` | Long | Path | ID del plato |

**Ejemplo**

```
POST /api/turnos/1/platos/3
```

**Respuesta `200 OK`:** el turno actualizado, con el plato incluido en `platos`.

**Errores:** `404` si no existe el turno o el plato.

### `POST /api/turnos/{turnoId}/pago`

Crea un pago en estado `PENDIENTE` y lo asocia al turno (relación uno a uno). La fecha de creación se asigna automáticamente.

| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `turnoId` | Long | Path | ID del turno |

**Body**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `monto` | Decimal | Sí | Mayor o igual a 0 |

```json
{
  "monto": 34000.00
}
```

**Respuesta `200 OK`:** el turno actualizado, con el objeto `pago` completo.

**Errores:**
- `400` si el monto falta o es negativo.
- `404` si el turno no existe.

---

## ⚠️ Manejo de errores

Los errores se devuelven con un formato común, gestionado por `ManejadorGlobalErrores`.

| Código | Cuándo ocurre |
|--------|---------------|
| `400 Bad Request` | Validaciones de `@Valid` no superadas, o JSON mal formado / con tipos incorrectos |
| `404 Not Found` | El recurso solicitado (cliente, turno, plato) no existe |
| `409 Conflict` | Se intenta crear un plato con un nombre que ya existe |

**Ejemplo `400` por validación**

```json
{
  "status": 400,
  "mensaje": "Los datos enviados son incorrectos",
  "errores": {
    "cantidadComensales": "Debe haber al menos un comensal",
    "email": "El formato del email es incorrecto"
  }
}
```

**Ejemplo `400` por JSON inválido**

```json
{
  "status": 400,
  "mensaje": "El JSON enviado es inválido o contiene datos incorrectos"
}
```

**Ejemplo `404`**

```json
{
  "status": 404,
  "mensaje": "Turno no encontrado con id: 99"
}
```

**Ejemplo `409`**

```json
{
  "status": 409,
  "mensaje": "Ya existe un plato con el nombre: Pizza Muzzarella"
}
```

---

<div align="center">

Hecho con ☕ y Java por Bocado

</div>
