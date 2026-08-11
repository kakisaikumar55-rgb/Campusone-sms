# Database + Spring Boot integration

## 1. Create the database

```sh
mysql -u root -p < database/schema.sql
mysql -u root -p campusone < database/seed.sql
```

## 2. Spring Boot `application.properties`

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/campusone
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
```

Enable CORS for the React dev server (`http://localhost:8080` / `5173`).

## 3. REST endpoints the frontend already calls

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/api/students` | list students |
| GET | `/api/students/{studentId}` | single student |
| POST | `/api/students` | create |
| PUT | `/api/students/{studentId}` | update |
| DELETE | `/api/students/{studentId}` | delete |
| GET/POST | `/api/courses` | list / create |
| PUT/DELETE | `/api/courses/{id}` | update / delete |
| GET/POST | `/api/departments` | list / create |
| PUT/DELETE | `/api/departments/{id}` | update / delete |
| GET | `/api/marks`, `/api/marks/student/{studentId}` | list marks |
| POST/DELETE | `/api/marks`, `/api/marks/{id}` | create / delete |
| GET | `/api/attendance`, `/api/attendance/student/{studentId}` | list attendance |
| POST/DELETE | `/api/attendance`, `/api/attendance/{id}` | create / delete |

JSON fields use camelCase (`studentId`, `totalClasses`, `attendedClasses`).

## 4. Switch the frontend off mock data

Create `.env` in the project root:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
```
