const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRequest, authSchemas } = require("../middleware/validation");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou utilisateur existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security: []
 */

// Register a new user
router.post(
    "/register",
    validateRequest(authSchemas.register),
    async (req, res) => {
        try {
            const { password, roleId, parentId, schoolId, personalInfo } =
                req.body;

            // Check if user with this email already exists
            const existingUser = await req.prisma.userPersonalInfo.findUnique({
                where: { email: personalInfo.email },
            });

            if (existingUser) {
                return res.status(400).json({
                    error: "User already exists",
                    message: "A user with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user with personal info in a transaction
            const user = await req.prisma.user.create({
                data: {
                    password: hashedPassword,
                    roleId,
                    parentId,
                    schoolId,
                    personalInfo: {
                        create: personalInfo,
                    },
                },
                include: {
                    role: true,
                    personalInfo: true,
                    school: true,
                },
            });

            // Generate JWT token
            const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
            console.log("JWT Config:", { 
                secret: process.env.JWT_SECRET ? "***SET***" : "MISSING",
                expiresIn: expiresIn,
                expiresInType: typeof expiresIn 
            });
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: expiresIn }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({
                error: "Registration failed",
                message: error.message,
            });
        }
    }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security: []
 */

// Login user
router.post("/login", validateRequest(authSchemas.login), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const userPersonalInfo = await req.prisma.userPersonalInfo.findUnique({
            where: { email },
            include: {
                user: {
                    include: {
                        role: true,
                        school: true,
                    },
                },
            },
        });

        if (!userPersonalInfo) {
            return res.status(401).json({
                error: "Invalid credentials",
                message: "Email or password is incorrect",
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(
            password,
            userPersonalInfo.user.password
        );

        if (!isValidPassword) {
            return res.status(401).json({
                error: "Invalid credentials",
                message: "Email or password is incorrect",
            });
        }

        // Generate JWT token
        const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        console.log("JWT Config:", { 
            secret: process.env.JWT_SECRET ? "***SET***" : "MISSING",
            expiresIn: expiresIn,
            expiresInType: typeof expiresIn 
        });
        const token = jwt.sign(
            { userId: userPersonalInfo.user.id },
            process.env.JWT_SECRET,
            { expiresIn: expiresIn }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = userPersonalInfo.user;

        res.json({
            message: "Login successful",
            token,
            user: {
                ...userWithoutPassword,
                personalInfo: userPersonalInfo,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            error: "Login failed",
            message: error.message,
        });
    }
});

module.exports = router;
