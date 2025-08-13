const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ludora API",
            version: "1.0.0",
            description:
                "API complète pour la gestion d'établissements scolaires avec Prisma et Express",
            contact: {
                name: "Ludora Team",
                email: "contact@ludora.com",
            },
            license: {
                name: "ISC",
                url: "https://opensource.org/licenses/ISC",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Serveur de développement",
            },
            {
                url: "https://api.ludora.com",
                description: "Serveur de production",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Token JWT pour l'authentification",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Identifiant unique de l'utilisateur",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Date de création",
                        },
                        roleId: {
                            type: "string",
                            description: "ID du rôle de l'utilisateur",
                        },
                        parentId: {
                            type: "string",
                            nullable: true,
                            description: "ID du parent (optionnel)",
                        },
                        schoolId: {
                            type: "string",
                            nullable: true,
                            description: "ID de l'école (optionnel)",
                        },
                        role: {
                            $ref: "#/components/schemas/Role",
                        },
                        personalInfo: {
                            $ref: "#/components/schemas/UserPersonalInfo",
                        },
                        school: {
                            $ref: "#/components/schemas/School",
                        },
                    },
                },
                UserPersonalInfo: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom de famille",
                        },
                        firstName: {
                            type: "string",
                            description: "Prénom",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Adresse email unique",
                        },
                        phone: {
                            type: "string",
                            nullable: true,
                            description: "Numéro de téléphone",
                        },
                        image: {
                            type: "string",
                            nullable: true,
                            description: "URL de l'image de profil",
                        },
                        city: {
                            type: "string",
                            nullable: true,
                            description: "Ville",
                        },
                        zipCode: {
                            type: "string",
                            nullable: true,
                            description: "Code postal",
                        },
                    },
                },
                Role: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            enum: [
                                "admin",
                                "director",
                                "teacher",
                                "parent",
                                "child",
                            ],
                            description: "Nom du rôle",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                School: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom de l'école",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        city: {
                            type: "string",
                            nullable: true,
                            description: "Ville de l'école",
                        },
                        zipCode: {
                            type: "string",
                            nullable: true,
                            description: "Code postal de l'école",
                        },
                    },
                },
                Class: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom de la classe",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        createdByUserId: {
                            type: "string",
                            description: "ID de l'utilisateur créateur",
                        },
                        schoolId: {
                            type: "string",
                            nullable: true,
                            description: "ID de l'école",
                        },
                    },
                },
                Activity: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom de l'activité",
                        },
                        themeId: {
                            type: "string",
                            description: "ID du thème",
                        },
                        theme: {
                            $ref: "#/components/schemas/Theme",
                        },
                    },
                },
                Theme: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom du thème",
                        },
                        domainId: {
                            type: "string",
                            nullable: true,
                            description: "ID du domaine",
                        },
                        domain: {
                            $ref: "#/components/schemas/Domain",
                        },
                    },
                },
                Domain: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                            description: "Nom du domaine",
                        },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "admin@ludora.com",
                        },
                        password: {
                            type: "string",
                            example: "admin123",
                        },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Login successful",
                        },
                        token: {
                            type: "string",
                            description: "JWT token",
                        },
                        user: {
                            $ref: "#/components/schemas/User",
                        },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: ["password", "roleId", "personalInfo"],
                    properties: {
                        password: {
                            type: "string",
                            minLength: 6,
                            example: "newuser123",
                        },
                        roleId: {
                            type: "string",
                            example: "role-id-here",
                        },
                        parentId: {
                            type: "string",
                            nullable: true,
                        },
                        schoolId: {
                            type: "string",
                            nullable: true,
                        },
                        personalInfo: {
                            type: "object",
                            required: ["name", "firstName", "email"],
                            properties: {
                                name: {
                                    type: "string",
                                    example: "Doe",
                                },
                                firstName: {
                                    type: "string",
                                    example: "John",
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    example: "john.doe@example.com",
                                },
                                phone: {
                                    type: "string",
                                    example: "+33123456789",
                                },
                                city: {
                                    type: "string",
                                    example: "Paris",
                                },
                                zipCode: {
                                    type: "string",
                                    example: "75001",
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            description: "Type d'erreur",
                        },
                        message: {
                            type: "string",
                            description: "Message d'erreur détaillé",
                        },
                    },
                },
                HealthCheck: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "OK",
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                        },
                        service: {
                            type: "string",
                            example: "Ludora API",
                        },
                    },
                },
                PaginationResponse: {
                    type: "object",
                    properties: {
                        page: {
                            type: "integer",
                            description: "Page actuelle",
                        },
                        limit: {
                            type: "integer",
                            description: "Nombre d'éléments par page",
                        },
                        total: {
                            type: "integer",
                            description: "Nombre total d'éléments",
                        },
                        pages: {
                            type: "integer",
                            description: "Nombre total de pages",
                        },
                    },
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js", "./src/index.js", "./src/docs/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
