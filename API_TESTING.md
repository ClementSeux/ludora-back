# Ludora API Testing Examples

This file contains example HTTP requests for testing the Ludora API. You can use these with tools like Postman, Insomnia, or VS Code REST Client extension.

## Authentication

### Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ludora.com",
  "password": "admin123"
}
```

### Register New User

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "password": "newuser123",
  "roleId": "{{teacherRoleId}}",
  "schoolId": "{{schoolId}}",
  "personalInfo": {
    "name": "Doe",
    "firstName": "John",
    "email": "john.doe@example.com",
    "phone": "+33123456789",
    "city": "Paris",
    "zipCode": "75001"
  }
}
```

## Users

### Get All Users (Admin only)

```http
GET http://localhost:3000/api/users
Authorization: Bearer {{token}}
```

### Get User by ID

```http
GET http://localhost:3000/api/users/{{userId}}
Authorization: Bearer {{token}}
```

### Update User

```http
PUT http://localhost:3000/api/users/{{userId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "personalInfo": {
    "phone": "+33987654321",
    "city": "Lyon"
  }
}
```

### Add User to Class

```http
POST http://localhost:3000/api/users/{{userId}}/classes/{{classId}}
Authorization: Bearer {{token}}
```

## Roles

### Get All Roles

```http
GET http://localhost:3000/api/roles
Authorization: Bearer {{token}}
```

### Create Role (Admin only)

```http
POST http://localhost:3000/api/roles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "assistant"
}
```

## Schools

### Get All Schools

```http
GET http://localhost:3000/api/schools
Authorization: Bearer {{token}}
```

### Create School

```http
POST http://localhost:3000/api/schools
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "École Primaire Notre-Dame",
  "city": "Marseille",
  "zipCode": "13001"
}
```

### Get School by ID

```http
GET http://localhost:3000/api/schools/{{schoolId}}
Authorization: Bearer {{token}}
```

## Classes

### Get All Classes

```http
GET http://localhost:3000/api/classes
Authorization: Bearer {{token}}
```

### Create Class

```http
POST http://localhost:3000/api/classes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "CM1-A",
  "schoolId": "{{schoolId}}"
}
```

### Get Students in Class

```http
GET http://localhost:3000/api/classes/{{classId}}/students
Authorization: Bearer {{token}}
```

## Activities

### Get All Activities

```http
GET http://localhost:3000/api/activities
Authorization: Bearer {{token}}
```

### Create Activity

```http
POST http://localhost:3000/api/activities
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Division with Remainders",
  "themeId": "{{themeId}}"
}
```

## Themes

### Get All Themes

```http
GET http://localhost:3000/api/themes
Authorization: Bearer {{token}}
```

### Create Theme

```http
POST http://localhost:3000/api/themes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Algebra",
  "domainId": "{{domainId}}"
}
```

## Domains

### Get All Domains

```http
GET http://localhost:3000/api/domains
Authorization: Bearer {{token}}
```

### Create Domain

```http
POST http://localhost:3000/api/domains
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "History"
}
```

## Health Check

### API Health

```http
GET http://localhost:3000/health
```

## Query Parameters Examples

### Pagination

```http
GET http://localhost:3000/api/users?page=1&limit=5
Authorization: Bearer {{token}}
```

### Filtering

```http
GET http://localhost:3000/api/users?role=teacher
Authorization: Bearer {{token}}
```

```http
GET http://localhost:3000/api/schools?city=Paris
Authorization: Bearer {{token}}
```

```http
GET http://localhost:3000/api/activities?theme=Mathematics
Authorization: Bearer {{token}}
```

## Error Response Examples

### 401 Unauthorized

```json
{
    "error": "Access denied",
    "message": "No token provided"
}
```

### 403 Forbidden

```json
{
    "error": "Access denied",
    "message": "Insufficient permissions"
}
```

### 400 Bad Request

```json
{
    "error": "Validation Error",
    "message": "\"email\" must be a valid email"
}
```

### 404 Not Found

```json
{
    "error": "User not found",
    "message": "User with this ID does not exist"
}
```

## Testing Workflow

1. **Login** to get a JWT token
2. **Get Roles** to find role IDs
3. **Get Schools** to find school IDs
4. **Create or Get Classes** to find class IDs
5. **Create Users** and assign them to classes
6. **Test CRUD operations** with proper authorization

## Notes

-   Replace `{{token}}` with the actual JWT token from login response
-   Replace `{{userId}}`, `{{schoolId}}`, `{{classId}}`, etc. with actual IDs
-   Admin users have full access to all endpoints
-   Directors can manage their school's data
-   Teachers can manage their classes
-   Users can only access their own data (except admins)
