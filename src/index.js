const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Route imports
const userRoutes = require("./routes/users");
const roleRoutes = require("./routes/roles");
const schoolRoutes = require("./routes/schools");
const classRoutes = require("./routes/classes");
const activityRoutes = require("./routes/activities");
const themeRoutes = require("./routes/themes");
const domainRoutes = require("./routes/domains");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Make Prisma client available to all routes
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

// Swagger Documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Ludora API Documentation",
    })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/domains", domainRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérification de l'état de santé de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API fonctionnelle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *     security: []
 */
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Ludora API",
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Error:", error);

    if (error.code === "P2002") {
        return res.status(400).json({
            error: "Unique constraint violation",
            message: "A record with this data already exists",
        });
    }

    if (error.code === "P2025") {
        return res.status(404).json({
            error: "Record not found",
            message: "The requested record does not exist",
        });
    }

    res.status(500).json({
        error: "Internal Server Error",
        message:
            process.env.NODE_ENV === "development"
                ? error.message
                : "Something went wrong",
    });
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Ludora API is running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    console.log(
        `📚 API Documentation available at http://localhost:${PORT}/api-docs`
    );
    console.log(`📋 Swagger JSON at http://localhost:${PORT}/api-docs.json`);
});

module.exports = app;
