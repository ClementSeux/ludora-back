# Ludora Backend API

A comprehensive Node.js API built with Express.js and Prisma for managing educational institutions, users, classes, and activities.

## Features

-   🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
-   👥 **User Management** - Support for different user roles (admin, director, teacher, parent, child)
-   🏫 **School Management** - Multi-school support with hierarchical permissions
-   📚 **Class Management** - Class creation and student enrollment
-   🎯 **Activity & Theme Management** - Educational content organization
-   🛡️ **Security** - Rate limiting, CORS, helmet protection
-   ✅ **Data Validation** - Request validation using Joi
-   📊 **Database** - PostgreSQL with Prisma ORM

## Quick Start

### Prerequisites

-   Node.js (v16 or higher)
-   PostgreSQL database
-   npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd ludora-back
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your database credentials:

    ```env
    NODE_ENV=development
    PORT=3000
    DATABASE_URL="postgresql://username:password@localhost:5432/ludora?schema=public"
    JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
    JWT_EXPIRES_IN="7d"
    ```

4. **Database Setup**

    ```bash
    # Generate Prisma client
    npx prisma generate

    # Run migrations
    npx prisma migrate dev

    # Seed the database
    npm run db:seed
    ```

5. **Start the server**

    ```bash
    # Development mode with auto-reload
    npm run dev

    # Production mode
    npm start
    ```

The API will be available at `http://localhost:3000`

## API Documentation

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### Default Users (after seeding)

| Role     | Email               | Password    | Description        |
| -------- | ------------------- | ----------- | ------------------ |
| Admin    | admin@ludora.com    | admin123    | Full system access |
| Director | director@ludora.com | director123 | School management  |
| Teacher  | teacher@ludora.com  | teacher123  | Class management   |

### API Endpoints

#### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - User login

#### Users

-   `GET /api/users` - Get all users (admin only)
-   `GET /api/users/:id` - Get user by ID
-   `POST /api/users` - Create user (admin only)
-   `PUT /api/users/:id` - Update user
-   `DELETE /api/users/:id` - Delete user (admin only)
-   `POST /api/users/:userId/classes/:classId` - Add user to class
-   `DELETE /api/users/:userId/classes/:classId` - Remove user from class

#### Roles

-   `GET /api/roles` - Get all roles
-   `GET /api/roles/:id` - Get role by ID
-   `POST /api/roles` - Create role (admin only)
-   `PUT /api/roles/:id` - Update role (admin only)
-   `DELETE /api/roles/:id` - Delete role (admin only)

#### Schools

-   `GET /api/schools` - Get all schools
-   `GET /api/schools/:id` - Get school by ID
-   `POST /api/schools` - Create school
-   `PUT /api/schools/:id` - Update school
-   `DELETE /api/schools/:id` - Delete school (admin only)

#### Classes

-   `GET /api/classes` - Get all classes
-   `GET /api/classes/:id` - Get class by ID
-   `POST /api/classes` - Create class
-   `PUT /api/classes/:id` - Update class
-   `DELETE /api/classes/:id` - Delete class
-   `GET /api/classes/:id/students` - Get students in class

#### Activities

-   `GET /api/activities` - Get all activities
-   `GET /api/activities/:id` - Get activity by ID
-   `POST /api/activities` - Create activity
-   `PUT /api/activities/:id` - Update activity
-   `DELETE /api/activities/:id` - Delete activity (admin only)

#### Themes

-   `GET /api/themes` - Get all themes
-   `GET /api/themes/:id` - Get theme by ID
-   `POST /api/themes` - Create theme
-   `PUT /api/themes/:id` - Update theme
-   `DELETE /api/themes/:id` - Delete theme (admin only)

#### Domains

-   `GET /api/domains` - Get all domains
-   `GET /api/domains/:id` - Get domain by ID
-   `POST /api/domains` - Create domain
-   `PUT /api/domains/:id` - Update domain
-   `DELETE /api/domains/:id` - Delete domain (admin only)

### Health Check

-   `GET /health` - API health status

## Data Model

### User Roles

-   **Admin**: Full system access
-   **Director**: School-level management
-   **Teacher**: Class-level management
-   **Parent**: Access to child's information
-   **Child**: Student access

### Key Relationships

-   Users belong to roles and optionally to schools
-   Users can have parent-child relationships
-   Classes are created by teachers/directors and belong to schools
-   Students can be enrolled in multiple classes
-   Activities belong to themes, which belong to domains

## Development

### Database Commands

```bash
# View database in browser
npm run db:studio

# Reset database
npm run db:reset

# Create new migration
npx prisma migrate dev --name migration-name

# Deploy migrations to production
npx prisma migrate deploy
```

### Project Structure

```
src/
├── index.js              # Main application entry point
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── validation.js     # Request validation schemas
└── routes/
    ├── auth.js           # Authentication routes
    ├── users.js          # User management routes
    ├── roles.js          # Role management routes
    ├── schools.js        # School management routes
    ├── classes.js        # Class management routes
    ├── activities.js     # Activity management routes
    ├── themes.js         # Theme management routes
    └── domains.js        # Domain management routes

prisma/
├── schema.prisma         # Database schema definition
└── seed.js              # Database seeding script
```

## Security Features

-   Password hashing with bcrypt
-   JWT token authentication
-   Role-based access control
-   Request rate limiting
-   Input validation and sanitization
-   CORS protection
-   Security headers with helmet

## Error Handling

The API uses consistent error response format:

```json
{
    "error": "Error Type",
    "message": "Detailed error message"
}
```

Common HTTP status codes:

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request (validation errors)
-   `401` - Unauthorized (missing/invalid token)
-   `403` - Forbidden (insufficient permissions)
-   `404` - Not Found
-   `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
