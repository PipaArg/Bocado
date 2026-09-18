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




## 📌 Endpoints principales

Turnos

| Método | Endpoint | Descripción | Body / Params |
|--------|----------|-------------|----------------|
| `POST` | `/api/turnos/crearTurno` | Crea un nuevo turno en estado `PENDIENTE` | JSON: `fecha`, `hora`, `cantidadComensales`, `nombreCliente`, `email` |
| `GET` | `/api/turnos/listarTurnos` | Lista todos los turnos | - |
| `GET` | `/api/turnos/obtenerTurno/{id}` | Obtiene un turno por su ID | Path param: `id` |
| `PUT` | `/api/turnos/actualizarTurno/{id}` | Actualiza los datos de un turno existente | Path param: `id` + JSON con los datos a actualizar |
| `PATCH` | `/api/turnos/cambiarEstado/{id}` | Cambia el estado de un turno (`PENDIENTE`, `CONFIRMADO`, `CANCELADO`) | Path param: `id` + Query param: `estado` |
| `DELETE` | `/api/turnos/eliminarTurno/{id}` | Elimina un turno | Path param: `id` |



---

<div align="center">

Hecho con ☕ y Java por Bocado

</div>
