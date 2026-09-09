# Bocado
Gestor de restaurantes

Trabajo Practico Integrador - Aplicaciones Interactivas

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
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
- [PostgreSQL / MySQL] instalado y corriendo 

## 🚀 Instalación y ejecución

1. Clonar el repositorio
   ```bash
   git clone https://github.com/[usuario]/[repositorio].git
   cd [repositorio]
   ```

2. Configurar la base de datos en `src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/[nombre_db]
   spring.datasource.username=[usuario]
   spring.datasource.password=[password]
   ```

3. Compilar y ejecutar
   ```bash
   ./mvnw spring-boot:run
   ```

4. La aplicación quedará disponible en:
   ```
   http://localhost:8080
   ```

## 📖 Documentación de la API




## 📌 Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/[recurso]` | Lista todos los [recursos] |
| GET | `/api/[recurso]/{id}` | Obtiene un [recurso] por id |
| POST | `/api/[recurso]` | Crea un nuevo [recurso] |
| PUT | `/api/[recurso]/{id}` | Actualiza un [recurso] |
| DELETE | `/api/[recurso]/{id}` | Elimina un [recurso] |


---

<div align="center">

Hecho con ☕ y Java por Bocado

</div>
